import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileSearch, Loader2, Printer, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Topic, Strongman } from "./types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { printRundown } from "./PrintStrongman";

interface StrongmanButtonProps {
  topic: Topic;
  onChange: (strongman: Strongman | undefined) => void;
}

export const StrongmanButton = ({ topic, onChange }: StrongmanButtonProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [argumentInput, setArgumentInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  const hasStrongman = !!topic.strongman?.content;

  // Pre-fill with existing prompt or topic title when opening
  useEffect(() => {
    if (isOpen && !hasStrongman) {
      // Default to topic title + take for new generation
      const defaultPrompt = topic.take 
        ? `${topic.title}\n\nMy angle: ${topic.take}`
        : topic.title;
      setArgumentInput(defaultPrompt);
    } else if (isOpen && hasStrongman && isEditing) {
      // Pre-fill with the previous prompt when regenerating
      setArgumentInput(topic.strongman?.prompt || topic.title);
    }
  }, [isOpen, hasStrongman, isEditing, topic.title, topic.take, topic.strongman?.prompt]);

  const generateStrongman = async () => {
    if (!argumentInput.trim()) {
      toast({ description: "Enter a topic for the rundown", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ask-ai", {
        body: {
          prompt: argumentInput,
          rundownMode: true,
          model: "gpt-4o"
        }
      });

      if (error) throw error;

      const strongman: Strongman = {
        content: data.response,
        generatedAt: new Date().toISOString(),
        prompt: argumentInput
      };

      onChange(strongman);
      setIsEditing(false);
      toast({ description: "Rundown generated!" });
    } catch (error) {
      console.error("Error generating strongman:", error);
      toast({ 
        description: "Failed to generate rundown", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    setIsEditing(true);
    setArgumentInput(topic.strongman?.prompt || topic.title);
  };

  const handlePrint = () => {
    if (topic.strongman) {
      printRundown(topic);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "h-6 px-1.5",
            hasStrongman 
              ? "text-purple-500 hover:text-purple-600" 
              : "text-muted-foreground hover:text-purple-500"
          )}
          title={hasStrongman ? "View rundown" : "Generate rundown"}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileSearch className={cn("h-3.5 w-3.5", hasStrongman && "fill-current")} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileSearch className="h-4 w-4 text-purple-500" />
              Rundown
            </div>
            {hasStrongman && !isEditing && (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                  onClick={handlePrint}
                  title="Print"
                >
                  <Printer className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2"
                  onClick={handleRegenerate}
                  disabled={isLoading}
                  title="Regenerate"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                </Button>
              </div>
            )}
          </div>
          
          {hasStrongman && !isEditing ? (
            <>
              <ScrollArea className="h-[300px] rounded-md border p-3">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm">
                    {topic.strongman!.content}
                  </div>
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
                Generated {new Date(topic.strongman!.generatedAt).toLocaleString()}
              </p>
            </>
          ) : (
            <div className="space-y-3">
              <Textarea
                placeholder="Enter a topic to research..."
                value={argumentInput}
                onChange={(e) => setArgumentInput(e.target.value)}
                className="min-h-[100px] text-sm"
                disabled={isLoading}
              />
              <div className="flex gap-2">
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={generateStrongman}
                  disabled={isLoading || !argumentInput.trim()}
                  className="gap-2 flex-1"
                  size="sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                     <>
                       <FileSearch className="h-4 w-4" />
                       {isEditing ? "Regenerate" : "Generate Rundown"}
                     </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
