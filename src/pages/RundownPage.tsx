import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileSearch, Printer, ImagePlus, X } from "lucide-react";
import { Topic, HourBlock } from "@/components/admin/show-prep/types";
import { printRundownSummary } from "@/components/admin/show-prep/PrintStrongman";
import { useToast } from "@/hooks/use-toast";
import { formatRundownContent } from "@/components/rundown/formatRundownContent";

const RundownPage = () => {
  const { date, topicId } = useParams<{ date: string; topicId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

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

      if (rawData && typeof rawData === "object" && Array.isArray((rawData as any).topics)) {
        const found = (rawData as any).topics.find((t: Topic) => t.id === topicId);
        if (found) return found;
      }
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

  const updateTopicImages = async (newImages: string[]) => {
    const { data, error } = await supabase
      .from("show_prep_notes")
      .select("topics")
      .eq("date", date!)
      .maybeSingle();

    if (error || !data) return;

    const rawData = data.topics as any;

    const updateTopic = (t: Topic) => {
      if (t.id === topicId) return { ...t, images: newImages };
      return t;
    };

    let updatedTopics: any;
    if (Array.isArray(rawData?.topics)) {
      updatedTopics = { ...rawData, topics: rawData.topics.map(updateTopic) };
    } else if (Array.isArray(rawData?.hours)) {
      updatedTopics = {
        ...rawData,
        hours: rawData.hours.map((h: HourBlock) => ({
          ...h,
          topics: h.topics?.map(updateTopic) || [],
        })),
      };
    } else return;

    await supabase
      .from("show_prep_notes")
      .update({ topics: updatedTopics })
      .eq("date", date!);

    queryClient.invalidateQueries({ queryKey: ["rundown", date, topicId] });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data, error } = await supabase.functions.invoke("upload-show-note-image", {
        body: formData,
      });

      if (error) throw error;

      const currentImages = topic?.images || [];
      await updateTopicImages([data.url, ...currentImages]);
      toast({ title: "Image uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async () => {
    const currentImages = topic?.images || [];
    await updateTopicImages(currentImages.slice(1));
    toast({ title: "Image removed" });
  };

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

  const heroImage = topic.images?.[0];

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

        {/* Hero image */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        {heroImage ? (
          <div className="mb-8 rounded-xl overflow-hidden border border-border/50 shadow-lg relative group">
            <img
              src={heroImage}
              alt={topic.title}
              className="w-full aspect-video object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <ImagePlus className="h-4 w-4" />
              {uploading ? "Uploading..." : "Add hero image"}
            </Button>
          </div>
        )}

        {/* Rundown content */}
        <div className="space-y-1">
          {formatRundownContent(topic.strongman.content)}
        </div>
      </div>
    </div>
  );
};

export default RundownPage;
