import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2, Pencil, X, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Topic, Link, HourBlock } from "@/components/admin/show-prep/types";
import { v4 as uuidv4 } from "uuid";

const TopicResources = () => {
  const { date, topicId } = useParams<{ date: string; topicId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Fetch show prep notes for the date
  const { data: showPrepData, isLoading } = useQuery({
    queryKey: ["show-prep-notes", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("show_prep_notes")
        .select("*")
        .eq("date", date)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!date,
  });

  // Get current topic from the data - handle nested hours structure
  const rawData = showPrepData?.topics as unknown;
  const hours: HourBlock[] = (rawData && typeof rawData === 'object' && Array.isArray((rawData as { hours?: unknown }).hours))
    ? (rawData as { hours: HourBlock[] }).hours
    : [];
  const allTopics = hours.flatMap(h => h.topics);
  const topic = allTopics.find(t => t.id === topicId);
  const links = topic?.links || [];

  // Get thumbnail URL for a link
  const getThumbnailUrl = (url: string) => {
    return `https://image.thum.io/get/width/300/${url}`;
  };

  // Fetch title from URL
  const fetchTitleFromUrl = async (inputUrl: string) => {
    if (!inputUrl.trim()) return;
    
    let processedUrl = inputUrl.trim();
    if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
      processedUrl = "https://" + processedUrl;
    }

    setIsFetchingTitle(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-link-metadata", {
        body: { url: processedUrl },
      });
      
      if (!error && data?.title) {
        setTitle(data.title);
      }
    } catch (e) {
      console.error("Failed to fetch title:", e);
    } finally {
      setIsFetchingTitle(false);
    }
  };

  // Add link mutation - matches Resources.tsx pattern
  const addMutation = useMutation({
    mutationFn: async ({ title, url }: { title: string; url: string }) => {
      // Re-fetch the latest data to avoid stale state
      const { data: latestData, error: fetchError } = await supabase
        .from("show_prep_notes")
        .select("*")
        .eq("date", date)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      if (!latestData) throw new Error("Show prep notes not found");

      const latestRawData = latestData.topics as unknown;
      const latestHours: HourBlock[] = (latestRawData && typeof latestRawData === 'object' && Array.isArray((latestRawData as { hours?: unknown }).hours))
        ? (latestRawData as { hours: HourBlock[] }).hours
        : [];

      let processedUrl = url.trim();
      if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
        processedUrl = "https://" + processedUrl;
      }

      const newLink: Link = {
        id: uuidv4(),
        url: processedUrl,
        title: title.trim(),
        thumbnail_url: getThumbnailUrl(processedUrl),
      };

      // Update the topic with the new link
      const updatedHours = latestHours.map(hour => ({
        ...hour,
        topics: hour.topics.map(t => 
          t.id === topicId ? { ...t, links: [...t.links, newLink] } : t
        )
      }));

      const { error } = await supabase
        .from("show_prep_notes")
        .update({ topics: JSON.parse(JSON.stringify({ hours: updatedHours })) })
        .eq("date", date);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["show-prep-notes", date] });
      setTitle("");
      setUrl("");
      setIsAdding(false);
      toast({ title: "Link added" });
    },
    onError: () => {
      toast({ title: "Failed to add link", variant: "destructive" });
    },
  });

  // Update link title mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { data: latestData, error: fetchError } = await supabase
        .from("show_prep_notes")
        .select("*")
        .eq("date", date)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      if (!latestData) throw new Error("Show prep notes not found");

      const latestRawData = latestData.topics as unknown;
      const latestHours: HourBlock[] = (latestRawData && typeof latestRawData === 'object' && Array.isArray((latestRawData as { hours?: unknown }).hours))
        ? (latestRawData as { hours: HourBlock[] }).hours
        : [];

      const updatedHours = latestHours.map(hour => ({
        ...hour,
        topics: hour.topics.map(t => 
          t.id === topicId 
            ? { ...t, links: t.links.map(l => l.id === id ? { ...l, title: title.trim() } : l) }
            : t
        )
      }));

      const { error } = await supabase
        .from("show_prep_notes")
        .update({ topics: JSON.parse(JSON.stringify({ hours: updatedHours })) })
        .eq("date", date);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["show-prep-notes", date] });
      setEditingId(null);
      toast({ title: "Title updated" });
    },
  });

  // Delete link mutation
  const deleteMutation = useMutation({
    mutationFn: async (linkId: string) => {
      const { data: latestData, error: fetchError } = await supabase
        .from("show_prep_notes")
        .select("*")
        .eq("date", date)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      if (!latestData) throw new Error("Show prep notes not found");

      const latestRawData = latestData.topics as unknown;
      const latestHours: HourBlock[] = (latestRawData && typeof latestRawData === 'object' && Array.isArray((latestRawData as { hours?: unknown }).hours))
        ? (latestRawData as { hours: HourBlock[] }).hours
        : [];

      const updatedHours = latestHours.map(hour => ({
        ...hour,
        topics: hour.topics.map(t => 
          t.id === topicId 
            ? { ...t, links: t.links.filter(l => l.id !== linkId) }
            : t
        )
      }));

      const { error } = await supabase
        .from("show_prep_notes")
        .update({ topics: JSON.parse(JSON.stringify({ hours: updatedHours })) })
        .eq("date", date);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["show-prep-notes", date] });
      toast({ title: "Link deleted" });
    },
  });

  // Clear all links mutation
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const { data: latestData, error: fetchError } = await supabase
        .from("show_prep_notes")
        .select("*")
        .eq("date", date)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      if (!latestData) throw new Error("Show prep notes not found");

      const latestRawData = latestData.topics as unknown;
      const latestHours: HourBlock[] = (latestRawData && typeof latestRawData === 'object' && Array.isArray((latestRawData as { hours?: unknown }).hours))
        ? (latestRawData as { hours: HourBlock[] }).hours
        : [];

      const updatedHours = latestHours.map(hour => ({
        ...hour,
        topics: hour.topics.map(t => 
          t.id === topicId ? { ...t, links: [] } : t
        )
      }));

      const { error } = await supabase
        .from("show_prep_notes")
        .update({ topics: JSON.parse(JSON.stringify({ hours: updatedHours })) })
        .eq("date", date);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["show-prep-notes", date] });
      toast({ title: "All links cleared" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && url.trim()) {
      addMutation.mutate({ title, url });
    }
  };

  const startEditing = (link: Link) => {
    setEditingId(link.id);
    setEditTitle(link.title || "");
  };

  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      updateMutation.mutate({ id: editingId, title: editTitle });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto text-center py-12">
          <p className="text-muted-foreground mb-4">Topic not found</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header - matches Resources.tsx exactly */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">{topic.title} - Resources</h1>
          <div className="flex gap-2">
            {links.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10">
                    Clear All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all resources?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {links.length} resource links. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => clearAllMutation.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            )}
          </div>
        </div>

        {/* Add Link Form - uses form onSubmit like Resources.tsx */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-8 p-4 border border-border rounded-lg bg-card">
            <div className="space-y-3">
              <div className="relative">
                <Input
                  placeholder="URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onBlur={() => fetchTitleFromUrl(url)}
                  autoFocus
                />
              </div>
              <div className="relative">
                <Input
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isFetchingTitle}
                />
                {isFetchingTitle && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={addMutation.isPending || !title.trim() || !url.trim()}>
                  Add
                </Button>
                <Button type="button" variant="outline" onClick={() => { setIsAdding(false); setTitle(""); setUrl(""); }}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Links List - matches Resources.tsx exactly */}
        {links.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No resources yet. Add your first link!</p>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <div
                key={link.id}
                className="group flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
              >
                {/* Thumbnail */}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-40 h-24 rounded overflow-hidden bg-muted"
                >
                  <img
                    src={link.thumbnail_url || getThumbnailUrl(link.url)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </a>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {editingId === link.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                        className="text-lg"
                      />
                      <Button size="icon" variant="ghost" onClick={saveEdit}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xl font-medium text-foreground hover:text-primary transition-colors truncate"
                    >
                      {link.title || "Untitled"}
                    </a>
                  )}
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {(() => {
                      try {
                        return new URL(link.url).hostname;
                      } catch {
                        return link.url;
                      }
                    })()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => startEditing(link)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMutation.mutate(link.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicResources;
