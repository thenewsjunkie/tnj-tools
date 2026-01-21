import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BicepsFlexed, Loader2, Printer, RefreshCw } from "lucide-react";
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
import { printStrongman } from "./PrintStrongman";

interface StrongmanButtonProps {
  topic: Topic;
  onChange: (strongman: Strongman | undefined) => void;
}

export const StrongmanButton = ({ topic, onChange }: StrongmanButtonProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const hasStrongman = !!topic.strongman?.content;

  const generateStrongman = async () => {
    if (!topic.title.trim()) {
      toast({ description: "Topic needs a title first", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const prompt = topic.take 
        ? `Topic: ${topic.title}\n\nMy angle/take on this: ${topic.take}`
        : `Topic: ${topic.title}`;

      const { data, error } = await supabase.functions.invoke("ask-ai", {
        body: {
          prompt,
          strongmanMode: true,
          model: "gpt-4o"
        }
      });

      if (error) throw error;

      const strongman: Strongman = {
        content: data.response,
        generatedAt: new Date().toISOString()
      };

      onChange(strongman);
      toast({ description: "Strongman argument generated!" });
    } catch (error) {
      console.error("Error generating strongman:", error);
      toast({ 
        description: "Failed to generate strongman argument", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (topic.strongman) {
      printStrongman(topic);
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
              ? "text-blue-500 hover:text-blue-600" 
              : "text-muted-foreground hover:text-blue-500"
          )}
          title={hasStrongman ? "View strongman argument" : "Generate strongman argument"}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <BicepsFlexed className={cn("h-3.5 w-3.5", hasStrongman && "fill-current")} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BicepsFlexed className="h-4 w-4 text-blue-500" />
              Strongman Argument
            </div>
            {hasStrongman && (
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
                  onClick={generateStrongman}
                  disabled={isLoading}
                  title="Regenerate"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                </Button>
              </div>
            )}
          </div>
          
          {hasStrongman ? (
            <>
              <ScrollArea className="h-[300px] rounded-md border p-3">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm">
                    {topic.strongman!.content}
                  </div>
                </div>
              </ScrollArea>
              <p className="text-xs text-muted-foreground">
                Generated {new Date(topic.strongman!.generatedAt).toLocaleString()}
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                Generate a comprehensive argument analysis with facts and myth-busters
              </p>
              <Button
                onClick={generateStrongman}
                disabled={isLoading || !topic.title.trim()}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BicepsFlexed className="h-4 w-4" />
                    Generate Strongman
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
