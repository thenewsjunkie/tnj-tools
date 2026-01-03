import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoResource {
  id: string;
  title: string;
  url: string;
  display_order: number;
  created_at: string;
}

const Resources = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
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

  const addMutation = useMutation({
    mutationFn: async ({ title, url }: { title: string; url: string }) => {
      const maxOrder = resources.length > 0 
        ? Math.max(...resources.map(r => r.display_order)) 
        : -1;
      
      let processedUrl = url.trim();
      if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
        processedUrl = "https://" + processedUrl;
      }

      const { error } = await supabase.from("video_resources").insert({
        title: title.trim(),
        url: processedUrl,
        display_order: maxOrder + 1,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && url.trim()) {
      addMutation.mutate({ title, url });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Resources</h1>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          )}
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-8 p-4 border border-border rounded-lg bg-card">
            <div className="space-y-3">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              <Input
                placeholder="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={addMutation.isPending}>
                  Add
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
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
          <div className="space-y-3">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="group flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-xl font-medium text-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-5 w-5 text-muted-foreground" />
                  {resource.title}
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={() => deleteMutation.mutate(resource.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
