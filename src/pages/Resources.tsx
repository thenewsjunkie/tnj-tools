import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
import { AddResourceForm } from "@/components/resources/AddResourceForm";
import { SortableResourceCard } from "@/components/resources/SortableResourceCard";
import { useAddToHopper } from "@/hooks/useAddToHopper";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface VideoResource {
  id: string;
  title: string;
  url: string;
  display_order: number;
  created_at: string;
  thumbnail_url: string | null;
  type: string;
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
  const addToHopper = useAddToHopper();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Fetch title and OG image from URL
  const fetchTitleFromUrl = async (inputUrl: string): Promise<string | null> => {
    if (!inputUrl.trim()) return null;
    
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
      
      // Return the OG image if found
      return data?.ogImage || null;
    } catch (e) {
      console.error("Failed to fetch metadata:", e);
      return null;
    } finally {
      setIsFetchingTitle(false);
    }
  };

  const getThumbnailUrl = (url: string) => {
    return `https://image.thum.io/get/width/300/${url}`;
  };

  const addMutation = useMutation({
    mutationFn: async ({ title, url, type, thumbnailUrl }: { title: string; url: string; type: string; thumbnailUrl?: string | null }) => {
      const maxOrder = resources.length > 0 
        ? Math.max(...resources.map(r => r.display_order)) 
        : -1;

      const { error } = await supabase.from("video_resources").insert({
        title: title.trim(),
        url: url,
        display_order: maxOrder + 1,
        thumbnail_url: thumbnailUrl || null,
        type: type,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-resources"] });
      setTitle("");
      setUrl("");
      setIsAdding(false);
      toast({ title: "Resource added" });
    },
    onError: () => {
      toast({ title: "Failed to add resource", variant: "destructive" });
    },
  });

  const removeThumbnailMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("video_resources")
        .update({ thumbnail_url: null })
        .eq("id", id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-resources"] });
      toast({ title: "Thumbnail removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove thumbnail", variant: "destructive" });
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
      toast({ title: "Resource deleted" });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("video_resources").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-resources"] });
      toast({ title: "All resources cleared" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (newResources: VideoResource[]) => {
      const updates = newResources.map((resource, index) => ({
        id: resource.id,
        title: resource.title,
        url: resource.url,
        display_order: index,
        thumbnail_url: resource.thumbnail_url,
        type: resource.type,
      }));

      const { error } = await supabase
        .from("video_resources")
        .upsert(updates, { onConflict: "id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-resources"] });
    },
    onError: () => {
      toast({ title: "Failed to reorder", variant: "destructive" });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = resources.findIndex((r) => r.id === active.id);
      const newIndex = resources.findIndex((r) => r.id === over.id);
      const newResources = arrayMove(resources, oldIndex, newIndex);
      reorderMutation.mutate(newResources);
    }
  };

  const handleSubmit = async (data: { title: string; url: string; type: string }) => {
    if (data.type === "link") {
      // Fetch OG image when adding
      const ogImage = await fetchTitleFromUrl(data.url);
      addMutation.mutate({ ...data, thumbnailUrl: ogImage });
    } else {
      addMutation.mutate({ ...data, thumbnailUrl: data.url });
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
                      This will permanently delete all {resources.length} resources. This action cannot be undone.
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
                Add Resource
              </Button>
            )}
          </div>
        </div>

        {isAdding && (
          <AddResourceForm
            onSubmit={handleSubmit}
            onCancel={() => { setIsAdding(false); setTitle(""); setUrl(""); }}
            isPending={addMutation.isPending}
            fetchTitleFromUrl={fetchTitleFromUrl}
            isFetchingTitle={isFetchingTitle}
            title={title}
            setTitle={setTitle}
            url={url}
            setUrl={setUrl}
          />
        )}

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : resources.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No resources yet. Add your first resource!</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={resources.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {resources.map((resource) => (
                  <SortableResourceCard
                    key={resource.id}
                    id={resource.id}
                    title={resource.title}
                    url={resource.url}
                    thumbnailUrl={resource.thumbnail_url}
                    type={resource.type as "link" | "image"}
                    isEditing={editingId === resource.id}
                    editTitle={editTitle}
                    onEditTitleChange={setEditTitle}
                    onStartEdit={() => startEditing(resource)}
                    onSaveEdit={saveEdit}
                    onCancelEdit={cancelEdit}
                    onDelete={() => deleteMutation.mutate(resource.id)}
                    getThumbnailUrl={getThumbnailUrl}
                    onRemoveThumbnail={resource.type !== "image" && resource.thumbnail_url ? () => removeThumbnailMutation.mutate(resource.id) : undefined}
                    onAddToHopper={() => addToHopper.mutate({
                      url: resource.url,
                      title: resource.title,
                      thumbnailUrl: resource.thumbnail_url || undefined,
                    })}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default Resources;
