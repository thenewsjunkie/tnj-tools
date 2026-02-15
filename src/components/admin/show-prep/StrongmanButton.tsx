import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileSearch, Loader2, Printer, RefreshCw, ExternalLink, Eye, Pencil, RotateCcw } from "lucide-react";
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

const DEFAULT_RUNDOWN_PROMPT = `I'm preparing a detailed breakdown on: {topic}

Give me a comprehensive, structured analysis in tight bullet points with clear section headers.

Be specific. Avoid vague summaries. Write at least 3-5 detailed bullet points per section. Do not summarize in one sentence what deserves a paragraph. Be thorough -- this is a full briefing document, not a quick summary.

Include specific names, dates, numbers, and direct quotes wherever possible.

Separate confirmed facts from claims, allegations, or speculation.

Include direct links to credible sources (AP, Reuters, official statements, court documents, regulatory filings, academic papers, etc.) whenever possible.

Organize the response into these sections:

1. Overview
- What this story/event is
- Why it is currently relevant
- The most important headline-level facts

2. Timeline
- Key events in chronological order
- Dates whenever available
- Major turning points

3. Key Players
- Individuals, organizations, governments, companies involved
- Their roles and stakes in the situation

4. Core Issues
- What is actually at the center of this story
- Legal, financial, scientific, ethical, or political dimensions
- What is disputed (if anything)

5. Verified Facts vs. Claims
- Clearly distinguish confirmed information from allegations or narratives
- Identify what remains unproven or unclear

6. Impact & Stakes
- Who is affected
- Financial, legal, cultural, or geopolitical consequences
- Why this matters beyond the headline

7. Reactions
- Statements from key figures
- Institutional responses
- Public or media reaction

8. What Happens Next
- Upcoming deadlines, hearings, releases, votes, matches, or expected developments
- Realistic possible outcomes

9. Unanswered Questions
- Gaps in evidence
- Inconsistencies
- What experts are still debating

End with:

3 Big Takeaways
- Clear, punchy summary bullets suitable for broadcast

Keep it structured, factual, and precise. Do not mention your knowledge cutoff date.`;

const LOCALSTORAGE_KEY = "rundown_system_prompt";

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
  const [editPromptOpen, setEditPromptOpen] = useState(false);
  const [argumentInput, setArgumentInput] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [systemPromptInput, setSystemPromptInput] = useState("");

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

  useEffect(() => {
    if (editPromptOpen) {
      const saved = localStorage.getItem(LOCALSTORAGE_KEY);
      setSystemPromptInput(saved || DEFAULT_RUNDOWN_PROMPT);
    }
  }, [editPromptOpen]);

  const generateStrongman = async () => {
    if (!argumentInput.trim()) {
      toast({ description: "Enter a topic for the rundown", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const customSystemPrompt = localStorage.getItem(LOCALSTORAGE_KEY) || undefined;
      const { data, error } = await supabase.functions.invoke("ask-ai", {
        body: { prompt: argumentInput, rundownMode: true, model: "gpt-4o", customSystemPrompt }
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

  const handleSaveSystemPrompt = () => {
    localStorage.setItem(LOCALSTORAGE_KEY, systemPromptInput);
    setEditPromptOpen(false);
    toast({ description: "System prompt saved!" });
  };

  const handleResetSystemPrompt = () => {
    setSystemPromptInput(DEFAULT_RUNDOWN_PROMPT);
    localStorage.removeItem(LOCALSTORAGE_KEY);
    toast({ description: "Prompt reset to default" });
  };

  return (
    <>
      <DropdownMenu modal={false}>
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
              <DropdownMenuItem onClick={() => setEditPromptOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit System Prompt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setIsRegenerating(true); setGenerateOpen(true); }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem onClick={() => { setIsRegenerating(false); setGenerateOpen(true); }}>
                <FileSearch className="h-4 w-4 mr-2" />
                Generate Rundown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditPromptOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit System Prompt
              </DropdownMenuItem>
            </>
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
            <div className="whitespace-pre-wrap text-sm text-foreground">
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

      {/* Edit System Prompt Dialog */}
      <Dialog open={editPromptOpen} onOpenChange={setEditPromptOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-purple-500" />
              Edit Rundown System Prompt
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Use <code className="bg-muted px-1 rounded">{'{topic}'}</code> as a placeholder for the user's topic input.
          </p>
          <Textarea
            value={systemPromptInput}
            onChange={(e) => setSystemPromptInput(e.target.value)}
            className="min-h-[400px] text-xs font-mono"
          />
          <div className="flex gap-2 justify-between">
            <Button variant="outline" size="sm" onClick={handleResetSystemPrompt} className="gap-2">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset to Default
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditPromptOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveSystemPrompt}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
