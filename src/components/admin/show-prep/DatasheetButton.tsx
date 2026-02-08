import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, Loader2, Printer, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Topic, Datasheet } from "./types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { printDatasheet } from "./PrintDatasheet";

const SECTION_OPTIONS = [
  { id: "basic", label: "Basic Details", description: "Key facts, people involved, background context" },
  { id: "timeline", label: "Timeline", description: "Chronological sequence of events" },
  { id: "polling", label: "Polling Data", description: "Public opinion and survey results" },
  { id: "players", label: "Key Players", description: "Who's involved, positions and motivations" },
  { id: "legal", label: "Legal/Regulatory", description: "Relevant laws, rulings, pending legislation" },
  { id: "financial", label: "Financial Impact", description: "Economic data, costs, budget implications" },
];

interface DatasheetButtonProps {
  topic: Topic;
  onChange: (datasheet: Datasheet | undefined) => void;
}

export const DatasheetButton = ({ topic, onChange }: DatasheetButtonProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>(["basic", "timeline"]);
  const [customPrompt, setCustomPrompt] = useState("");

  const hasDatasheet = !!topic.datasheet?.content;

  useEffect(() => {
    if (isOpen && hasDatasheet && isEditing) {
      setSelectedSections(topic.datasheet?.selectedSections || ["basic", "timeline"]);
      setCustomPrompt(topic.datasheet?.prompt || "");
    } else if (isOpen && !hasDatasheet) {
      setSelectedSections(["basic", "timeline"]);
      setCustomPrompt("");
    }
  }, [isOpen, hasDatasheet, isEditing]);

  const toggleSection = (id: string) => {
    setSelectedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const generateDatasheet = async () => {
    if (selectedSections.length === 0) {
      toast({ description: "Select at least one section", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const sectionLabels = selectedSections.map(id =>
        SECTION_OPTIONS.find(s => s.id === id)?.label || id
      );

      const prompt = customPrompt.trim()
        ? `${topic.title}\n\nAdditional context: ${customPrompt}`
        : topic.title;

      const { data, error } = await supabase.functions.invoke("ask-ai", {
        body: {
          prompt,
          datasheetMode: true,
          sections: sectionLabels,
          model: "gpt-4o",
        },
      });

      if (error) throw error;

      const datasheet: Datasheet = {
        content: data.response,
        generatedAt: new Date().toISOString(),
        prompt: customPrompt || undefined,
        selectedSections,
      };

      onChange(datasheet);
      setIsEditing(false);
      toast({ description: "Datasheet generated!" });
    } catch (error) {
      console.error("Error generating datasheet:", error);
      toast({ description: "Failed to generate datasheet", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    setIsEditing(true);
  };

  const handlePrint = () => {
    if (topic.datasheet) printDatasheet(topic);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "h-6 px-1.5",
            hasDatasheet
              ? "text-green-500 hover:text-green-600"
              : "text-muted-foreground hover:text-green-500"
          )}
          title={hasDatasheet ? "View datasheet" : "Generate datasheet"}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <BarChart3 className={cn("h-3.5 w-3.5", hasDatasheet && "fill-current")} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="h-4 w-4 text-green-500" />
              Datasheet
            </div>
            {hasDatasheet && !isEditing && (
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handlePrint} title="Print">
                  <Printer className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={handleRegenerate} disabled={isLoading} title="Edit and regenerate">
                  <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                </Button>
              </div>
            )}
          </div>

          {hasDatasheet && !isEditing ? (
            <>
              <ScrollArea className="h-[300px] rounded-md border p-3">
                <div className="whitespace-pre-wrap text-sm">{topic.datasheet!.content}</div>
              </ScrollArea>
              <p className="text-xs text-muted-foreground">
                Sections: {topic.datasheet!.selectedSections
                  .map(id => SECTION_OPTIONS.find(s => s.id === id)?.label || id)
                  .join(", ")}
              </p>
              <p className="text-xs text-muted-foreground">
                Generated {new Date(topic.datasheet!.generatedAt).toLocaleString()}
              </p>
            </>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Select sections to include:</p>
                {SECTION_OPTIONS.map((section) => (
                  <label
                    key={section.id}
                    className="flex items-start gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedSections.includes(section.id)}
                      onCheckedChange={() => toggleSection(section.id)}
                      disabled={isLoading}
                      className="mt-0.5"
                    />
                    <div className="leading-tight">
                      <span className="text-sm font-medium">{section.label}</span>
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              {isEditing && customPrompt && (
                <p className="text-xs text-muted-foreground">Previous context used:</p>
              )}
              <Textarea
                placeholder={isEditing
                  ? "Clarify or correct the topic (e.g., 'This is the Anna Kepner custody case in Ohio, not the musician')..."
                  : "Additional context or focus (optional)..."}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="min-h-[60px] text-sm"
                disabled={isLoading}
              />
              <div className="flex gap-2">
                {isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={generateDatasheet}
                  disabled={isLoading || selectedSections.length === 0}
                  className="gap-2 flex-1"
                  size="sm"
                >
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
                  ) : (
                    <><BarChart3 className="h-4 w-4" />{isEditing ? "Regenerate" : "Generate Datasheet"}</>
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
