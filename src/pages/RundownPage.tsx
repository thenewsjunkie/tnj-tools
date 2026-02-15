import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileSearch, Printer } from "lucide-react";
import { Topic, HourBlock } from "@/components/admin/show-prep/types";
import { printRundownSummary } from "@/components/admin/show-prep/PrintStrongman";

const formatRundownContent = (content: string) => {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={key++} className="h-3" />);
      continue;
    }

    // Section headers (## or lines like "1. Overview")
    const headerMatch = trimmed.match(/^#{1,3}\s+(.*)$/) || trimmed.match(/^(\d+)\.\s+\*\*(.+)\*\*$/);
    if (headerMatch) {
      const text = headerMatch[2] || headerMatch[1];
      elements.push(
        <h3 key={key++} className="text-lg font-semibold text-purple-400 border-l-2 border-purple-500 pl-3 mt-6 mb-2">
          {text.replace(/\*\*/g, "")}
        </h3>
      );
      continue;
    }

    // "3 Big Takeaways" special header
    if (trimmed.includes("Big Takeaway") || trimmed.includes("big takeaway")) {
      elements.push(
        <h3 key={key++} className="text-lg font-semibold text-amber-400 border-l-2 border-amber-500 pl-3 mt-6 mb-2">
          {trimmed.replace(/[*#]/g, "").trim()}
        </h3>
      );
      continue;
    }

    // Bold section headers (standalone **text**)
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      elements.push(
        <h3 key={key++} className="text-lg font-semibold text-purple-400 border-l-2 border-purple-500 pl-3 mt-6 mb-2">
          {trimmed.replace(/\*\*/g, "")}
        </h3>
      );
      continue;
    }

    // Bullet points
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      const bulletText = trimmed.replace(/^[-•]\s+/, "");
      elements.push(
        <div key={key++} className="flex items-start gap-2 pl-4 py-0.5">
          <span className="text-purple-400 mt-1 shrink-0">•</span>
          <span className="text-foreground/90" dangerouslySetInnerHTML={{
            __html: bulletText.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
          }} />
        </div>
      );
      continue;
    }

    // Numbered items
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      elements.push(
        <div key={key++} className="flex items-start gap-2 pl-4 py-0.5">
          <span className="text-purple-400 font-semibold shrink-0">{numberedMatch[1]}.</span>
          <span className="text-foreground/90" dangerouslySetInnerHTML={{
            __html: numberedMatch[2].replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
          }} />
        </div>
      );
      continue;
    }

    // Regular text
    elements.push(
      <p key={key++} className="text-foreground/85 pl-4" dangerouslySetInnerHTML={{
        __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
      }} />
    );
  }

  return elements;
};

const RundownPage = () => {
  const { date, topicId } = useParams<{ date: string; topicId: string }>();
  const navigate = useNavigate();

  const { data: topic, isLoading } = useQuery({
    queryKey: ["rundown", date, topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("show_prep_notes")
        .select("topics")
        .eq("date", date!)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("No data for this date");

      const rawData = data.topics as unknown;

      // New flat format: { topics: [...] }
      if (rawData && typeof rawData === "object" && Array.isArray((rawData as any).topics)) {
        const found = (rawData as any).topics.find((t: Topic) => t.id === topicId);
        if (found) return found;
      }
      // Old hour-based format: { hours: [...] }
      else if (rawData && typeof rawData === "object" && Array.isArray((rawData as any).hours)) {
        for (const hour of (rawData as any).hours) {
          const found = hour.topics?.find((t: Topic) => t.id === topicId);
          if (found) return found;
        }
      }
      throw new Error("Topic not found");
    },
    enabled: !!date && !!topicId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading rundown...</p>
      </div>
    );
  }

  if (!topic?.strongman?.content) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">No rundown found for this topic.</p>
        <Button variant="outline" onClick={() => navigate("/admin")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </Button>
      </div>
    );
  }

  const generatedDate = new Date(topic.strongman.generatedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => printRundownSummary(topic)}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Summary
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <FileSearch className="h-6 w-6 text-purple-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{topic.title}</h1>
          </div>
          <div className="flex flex-col gap-1 ml-14">
            <p className="text-sm text-muted-foreground">
              Rundown — Deep Dive
            </p>
            <p className="text-xs text-muted-foreground">
              Generated {generatedDate}
            </p>
            {topic.take && (
              <p className="text-sm text-orange-400 italic mt-1">
                Take: "{topic.take}"
              </p>
            )}
          </div>
        </div>

        {/* Rundown content */}
        <div className="space-y-1">
          {formatRundownContent(topic.strongman.content)}
        </div>
      </div>
    </div>
  );
};

export default RundownPage;
