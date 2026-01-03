import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2, Pencil, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
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

  // Mutation to update the topic
  const updateMutation = useMutation({
    mutationFn: async (updatedTopic: Topic) => {
      // Find which hour contains this topic and update it
      const updatedHours = hours.map(hour => ({
        ...hour,
        topics: hour.topics.map(t => 
          t.id === topicId ? updatedTopic : t
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
    },
    onError: (error) => {
      toast.error("Failed to save changes");
      console.error(error);
    },
  });

  // Fetch title from URL
  const fetchTitleFromUrl = async (inputUrl: string) => {
    if (!inputUrl.trim() || title.trim()) return;
    
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

  // Get thumbnail URL for a link
  const getThumbnailUrl = (url: string) => {
    return `https://image.thum.io/get/width/300/${url}`;
  };

  // Handle adding a new link
  const handleAddLink = () => {
    if (!url.trim() || !title.trim() || !topic) return;
    
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
    
    updateMutation.mutate({
      ...topic,
      links: [...topic.links, newLink],
    });
    
    setUrl("");
    setTitle("");
    setIsAdding(false);
    toast.success("Link added");
  };

  // Handle editing a link
  const startEditing = (link: Link) => {
    setEditingId(link.id);
    setEditTitle(link.title || "");
  };

  const saveEdit = () => {
    if (!topic || !editingId || !editTitle.trim()) return;
    
    updateMutation.mutate({
      ...topic,
      links: topic.links.map(l => 
        l.id === editingId ? { ...l, title: editTitle.trim() } : l
      ),
    });
    
    setEditingId(null);
    setEditTitle("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  // Handle deleting a link
  const handleDeleteLink = (linkId: string) => {
    if (!topic) return;
    
    updateMutation.mutate({
      ...topic,
      links: topic.links.filter(l => l.id !== linkId),
    });
    toast.success("Link deleted");
  };

  // Handle clearing all links
  const handleClearAllLinks = () => {
    if (!topic) return;
    
    updateMutation.mutate({
      ...topic,
      links: [],
    });
    toast.success("All links cleared");
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
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Resources for "{topic.title || "Untitled Topic"}"
          </h1>
          <div className="flex gap-2">
            {topic.links.length > 0 && (
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
                      This will permanently delete all {topic.links.length} resource links. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAllLinks}
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

        {/* Add Link Form */}
        {isAdding && (
          <div className="mb-8 p-4 border border-border rounded-lg bg-card">
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
                <Button onClick={handleAddLink} disabled={!title.trim() || !url.trim()}>
                  Add
                </Button>
                <Button variant="outline" onClick={() => { setIsAdding(false); setTitle(""); setUrl(""); }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Links List */}
        {topic.links.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No resources yet. Add your first link!</p>
        ) : (
          <div className="space-y-4">
            {topic.links.map((link) => (
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
                    onClick={() => handleDeleteLink(link.id)}
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
