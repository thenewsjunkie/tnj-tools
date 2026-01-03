import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ExternalLink, Pencil, X, Check, Loader2 } from "lucide-react";
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

interface VideoResource {
  id: string;
  title: string;
  url: string;
  display_order: number;
  created_at: string;
  thumbnail_url: string | null;
}

const Resources = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["video-resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_resources")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as VideoResource[];
    },
  });

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

  const getThumbnailUrl = (url: string) => {
    const encoded = encodeURIComponent(url);
    return `https://image.thum.io/get/width/300/${url}`;
  };

  const addMutation = useMutation({
    mutationFn: async ({ title, url }: { title: string; url: string }) => {
      const maxOrder = resources.length > 0 
        ? Math.max(...resources.map(r => r.display_order)) 
        : -1;
      
      let processedUrl = url.trim();
      if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
        processedUrl = "https://" + processedUrl;
      }

      const thumbnailUrl = getThumbnailUrl(processedUrl);

      const { error } = await supabase.from("video_resources").insert({
        title: title.trim(),
        url: processedUrl,
        display_order: maxOrder + 1,
        thumbnail_url: thumbnailUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-resources"] });
      setTitle("");
      setUrl("");
      setIsAdding(false);
      toast({ title: "Link added" });
    },
    onError: () => {
      toast({ title: "Failed to add link", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase
        .from("video_resources")
        .update({ title: title.trim() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-resources"] });
      setEditingId(null);
      toast({ title: "Title updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("video_resources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-resources"] });
      toast({ title: "Link deleted" });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("video_resources").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-resources"] });
      toast({ title: "All links cleared" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && url.trim()) {
      addMutation.mutate({ title, url });
    }
  };

  const startEditing = (resource: VideoResource) => {
    setEditingId(resource.id);
    setEditTitle(resource.title);
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Resources</h1>
          <div className="flex gap-2">
            {resources.length > 0 && (
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
                      This will permanently delete all {resources.length} resource links. This action cannot be undone.
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

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : resources.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No resources yet. Add your first link!</p>
        ) : (
          <div className="space-y-4">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="group flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
              >
                {/* Thumbnail */}
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-40 h-24 rounded overflow-hidden bg-muted"
                >
                  <img
                    src={resource.thumbnail_url || getThumbnailUrl(resource.url)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </a>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {editingId === resource.id ? (
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
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xl font-medium text-foreground hover:text-primary transition-colors truncate"
                    >
                      {resource.title}
                    </a>
                  )}
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {new URL(resource.url).hostname}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => startEditing(resource)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMutation.mutate(resource.id)}
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

export default Resources;
