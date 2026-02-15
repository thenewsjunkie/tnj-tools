import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileSearch, Loader2, Printer, RefreshCw, ExternalLink, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Topic, Strongman } from "./types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { printRundown } from "./PrintStrongman";

interface StrongmanButtonProps {
  topic: Topic;
  date: string;
  onChange: (strongman: Strongman | undefined) => void;
}

export const StrongmanButton = ({ topic, date, onChange }: StrongmanButtonProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [argumentInput, setArgumentInput] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  const hasStrongman = !!topic.strongman?.content;

  useEffect(() => {
    if (generateOpen) {
      if (isRegenerating && hasStrongman) {
        setArgumentInput(topic.strongman?.prompt || topic.title);
      } else {
        const defaultPrompt = topic.take
          ? `${topic.title}\n\nMy angle: ${topic.take}`
          : topic.title;
        setArgumentInput(defaultPrompt);
      }
    }
  }, [generateOpen, isRegenerating, hasStrongman, topic.title, topic.take, topic.strongman?.prompt]);

  const generateStrongman = async () => {
    if (!argumentInput.trim()) {
      toast({ description: "Enter a topic for the rundown", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ask-ai", {
        body: { prompt: argumentInput, rundownMode: true, model: "gpt-4o" }
      });
      if (error) throw error;

      const strongman: Strongman = {
        content: data.response,
        generatedAt: new Date().toISOString(),
        prompt: argumentInput
      };

      onChange(strongman);
      setGenerateOpen(false);
      setIsRegenerating(false);
      toast({ description: "Rundown generated!" });
    } catch (error) {
      console.error("Error generating strongman:", error);
      toast({ description: "Failed to generate rundown", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (topic.strongman) printRundown(topic);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className={cn(
              "h-6 px-1.5",
              hasStrongman
                ? "text-purple-500 hover:text-purple-600"
                : "text-muted-foreground hover:text-purple-500"
            )}
            title={hasStrongman ? "Rundown options" : "Generate rundown"}
          >
            <FileSearch className={cn("h-3.5 w-3.5", hasStrongman && "fill-current")} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {hasStrongman ? (
            <>
              <DropdownMenuItem onClick={() => setViewOpen(true)}>
                <Eye className="h-4 w-4 mr-2" />
                View Rundown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/admin/rundown/${date}/${topic.id}`)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Full Page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setIsRegenerating(true); setGenerateOpen(true); }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={() => { setIsRegenerating(false); setGenerateOpen(true); }}>
              <FileSearch className="h-4 w-4 mr-2" />
              Generate Rundown
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Rundown Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-purple-500" />
              Rundown
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] rounded-md border p-3">
            <div className="whitespace-pre-wrap text-sm">
              {topic.strongman?.content}
            </div>
          </ScrollArea>
          {topic.strongman?.prompt && (
            <p className="text-xs text-muted-foreground italic">
              Argument: "{topic.strongman.prompt.length > 50
                ? topic.strongman.prompt.substring(0, 50) + "..."
                : topic.strongman.prompt}"
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Generated {topic.strongman?.generatedAt && new Date(topic.strongman.generatedAt).toLocaleString()}
          </p>
        </DialogContent>
      </Dialog>

      {/* Generate/Regenerate Dialog */}
      <Dialog open={generateOpen} onOpenChange={(open) => { setGenerateOpen(open); if (!open) setIsRegenerating(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-purple-500" />
              {isRegenerating ? "Regenerate Rundown" : "Generate Rundown"}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Enter a topic to research..."
            value={argumentInput}
            onChange={(e) => setArgumentInput(e.target.value)}
            className="min-h-[100px] text-sm"
            disabled={isLoading}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setGenerateOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={generateStrongman} disabled={isLoading || !argumentInput.trim()} className="gap-2" size="sm">
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
              ) : (
                <><FileSearch className="h-4 w-4" />{isRegenerating ? "Regenerate" : "Generate"}</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
