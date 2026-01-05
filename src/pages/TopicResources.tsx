import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
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
import { AddResourceForm } from "@/components/resources/AddResourceForm";
import { SortableResourceCard } from "@/components/resources/SortableResourceCard";
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
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Get current topic from the data - handle both data structures
  const rawData = showPrepData?.topics as unknown;
  
  // Handle both data structures:
  // 1. New structure: { hours: HourBlock[] }
  // 2. Legacy/current structure: { topics: Topic[] }
  let allTopics: Topic[] = [];
  
  if (rawData && typeof rawData === 'object') {
    if (Array.isArray((rawData as { hours?: unknown }).hours)) {
      // New structure with hours
      const hours: HourBlock[] = (rawData as { hours: HourBlock[] }).hours;
      allTopics = hours.flatMap(h => h.topics);
    } else if (Array.isArray((rawData as { topics?: unknown }).topics)) {
      // Legacy flat topics structure
      allTopics = (rawData as { topics: Topic[] }).topics;
    }
  }
  
  const topic = allTopics.find(t => t.id === topicId);
  const links = topic?.links || [];

  // Get thumbnail URL for a link
  const getThumbnailUrl = (url: string) => {
    return `https://image.thum.io/get/width/300/${url}`;
  };

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

  // Add resource mutation
  const addMutation = useMutation({
    mutationFn: async ({ title, url, type, thumbnailUrl }: { title: string; url: string; type: string; thumbnailUrl?: string | null }) => {
      // Re-fetch the latest data to avoid stale state
      const { data: latestData, error: fetchError } = await supabase
        .from("show_prep_notes")
        .select("*")
        .eq("date", date)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      if (!latestData) throw new Error("Show prep notes not found");

      const latestRawData = latestData.topics as unknown;
      
      // Handle both data structures
      let isHoursStructure = false;
      let latestTopics: Topic[] = [];
      
      if (latestRawData && typeof latestRawData === 'object') {
        if (Array.isArray((latestRawData as { hours?: unknown }).hours)) {
          isHoursStructure = true;
          const latestHours: HourBlock[] = (latestRawData as { hours: HourBlock[] }).hours;
          latestTopics = latestHours.flatMap(h => h.topics);
        } else if (Array.isArray((latestRawData as { topics?: unknown }).topics)) {
          latestTopics = (latestRawData as { topics: Topic[] }).topics;
        }
      }

      const newLink: Link = {
        id: uuidv4(),
        url: url,
        title: title.trim(),
        thumbnail_url: type === "image" ? url : (thumbnailUrl || null),
        type: type as "link" | "image",
      };

      let updatedTopics: unknown;
      if (isHoursStructure) {
        const latestHours: HourBlock[] = (latestRawData as { hours: HourBlock[] }).hours;
        const updatedHours = latestHours.map(hour => ({
          ...hour,
          topics: hour.topics.map(t => 
            t.id === topicId ? { ...t, links: [...t.links, newLink] } : t
          )
        }));
        updatedTopics = { hours: updatedHours };
      } else {
        const updatedTopicsList = latestTopics.map(t => 
          t.id === topicId ? { ...t, links: [...t.links, newLink] } : t
        );
        updatedTopics = { topics: updatedTopicsList };
      }

      const { error } = await supabase
        .from("show_prep_notes")
        .update({ topics: JSON.parse(JSON.stringify(updatedTopics)) })
        .eq("date", date);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["show-prep-notes", date] });
      setTitle("");
      setUrl("");
      setIsAdding(false);
      toast({ title: "Resource added" });
    },
    onError: () => {
      toast({ title: "Failed to add resource", variant: "destructive" });
    },
  });

  // Helper to parse topic data and update it
  const parseAndUpdateTopics = async (
    updateFn: (topics: Topic[]) => Topic[]
  ) => {
    const { data: latestData, error: fetchError } = await supabase
      .from("show_prep_notes")
      .select("*")
      .eq("date", date)
      .maybeSingle();
    
    if (fetchError) throw fetchError;
    if (!latestData) throw new Error("Show prep notes not found");

    const latestRawData = latestData.topics as unknown;
    
    let isHoursStructure = false;
    let latestTopics: Topic[] = [];
    
    if (latestRawData && typeof latestRawData === 'object') {
      if (Array.isArray((latestRawData as { hours?: unknown }).hours)) {
        isHoursStructure = true;
        const latestHours: HourBlock[] = (latestRawData as { hours: HourBlock[] }).hours;
        latestTopics = latestHours.flatMap(h => h.topics);
      } else if (Array.isArray((latestRawData as { topics?: unknown }).topics)) {
        latestTopics = (latestRawData as { topics: Topic[] }).topics;
      }
    }

    const updatedTopicsList = updateFn(latestTopics);

    let updatedTopics: unknown;
    if (isHoursStructure) {
      const latestHours: HourBlock[] = (latestRawData as { hours: HourBlock[] }).hours;
      // Rebuild hours structure with updated topics
      const updatedHours = latestHours.map(hour => ({
        ...hour,
        topics: hour.topics.map(t => {
          const updated = updatedTopicsList.find(ut => ut.id === t.id);
          return updated || t;
        })
      }));
      updatedTopics = { hours: updatedHours };
    } else {
      updatedTopics = { topics: updatedTopicsList };
    }

    const { error } = await supabase
      .from("show_prep_notes")
      .update({ topics: JSON.parse(JSON.stringify(updatedTopics)) })
      .eq("date", date);
    
    if (error) throw error;
  };

  // Bulk add resources mutation
  const addBulkMutation = useMutation({
    mutationFn: async (urls: string[]) => {
      setBulkProgress({ current: 0, total: urls.length });

      // Fetch metadata for all URLs sequentially to track progress
      const newLinks: Link[] = [];
      for (let i = 0; i < urls.length; i++) {
        const rawUrl = urls[i];
        let processedUrl = rawUrl.trim();
        if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
          processedUrl = "https://" + processedUrl;
        }

        let fetchedTitle: string | null = null;
        let thumbnailUrl: string | null = null;
        try {
          const { data } = await supabase.functions.invoke("fetch-link-metadata", {
            body: { url: processedUrl },
          });
          fetchedTitle = data?.title || null;
          thumbnailUrl = data?.ogImage || null;
        } catch (e) {
          console.error("Failed to fetch metadata:", e);
        }

        newLinks.push({
          id: uuidv4(),
          url: processedUrl,
          title: fetchedTitle || processedUrl,
          thumbnail_url: thumbnailUrl,
          type: "link" as const,
        });

        setBulkProgress({ current: i + 1, total: urls.length });
      }

      await parseAndUpdateTopics((topics) =>
        topics.map(t =>
          t.id === topicId ? { ...t, links: [...t.links, ...newLinks] } : t
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["show-prep-notes", date] });
      setIsAdding(false);
      setBulkProgress(null);
      toast({ title: "Resources added" });
    },
    onError: () => {
      setBulkProgress(null);
      toast({ title: "Failed to add resources", variant: "destructive" });
    },
  });

  // Update link title mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      await parseAndUpdateTopics((topics) =>
        topics.map(t =>
          t.id === topicId
            ? { ...t, links: t.links.map(l => l.id === id ? { ...l, title: title.trim() } : l) }
            : t
        )
      );
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
      await parseAndUpdateTopics((topics) =>
        topics.map(t =>
          t.id === topicId
            ? { ...t, links: t.links.filter(l => l.id !== linkId) }
            : t
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["show-prep-notes", date] });
      toast({ title: "Resource deleted" });
    },
  });

  // Clear all links mutation
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await parseAndUpdateTopics((topics) =>
        topics.map(t =>
          t.id === topicId ? { ...t, links: [] } : t
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["show-prep-notes", date] });
      toast({ title: "All resources cleared" });
    },
  });

  // Remove thumbnail mutation
  const removeThumbnailMutation = useMutation({
    mutationFn: async (linkId: string) => {
      await parseAndUpdateTopics((topics) =>
        topics.map(t =>
          t.id === topicId
            ? { ...t, links: t.links.map(l => l.id === linkId ? { ...l, thumbnail_url: null } : l) }
            : t
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["show-prep-notes", date] });
      toast({ title: "Thumbnail removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove thumbnail", variant: "destructive" });
    },
  });

  // Reorder links mutation
  const reorderMutation = useMutation({
    mutationFn: async (newLinks: Link[]) => {
      await parseAndUpdateTopics((topics) =>
        topics.map(t =>
          t.id === topicId ? { ...t, links: newLinks } : t
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["show-prep-notes", date] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((l) => l.id === active.id);
      const newIndex = links.findIndex((l) => l.id === over.id);
      const newLinks = arrayMove(links, oldIndex, newIndex);
      reorderMutation.mutate(newLinks);
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

        {/* Header */}
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
                      This will permanently delete all {links.length} resources. This action cannot be undone.
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

        {/* Add Resource Form */}
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
            onBulkSubmit={(urls) => addBulkMutation.mutate(urls)}
            isBulkAdding={addBulkMutation.isPending}
            bulkProgress={bulkProgress}
          />
        )}

        {/* Resources List */}
        {links.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No resources yet. Add your first resource!</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={links.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {links.map((link) => (
                  <SortableResourceCard
                    key={link.id}
                    id={link.id}
                    title={link.title || "Untitled"}
                    url={link.url}
                    thumbnailUrl={link.thumbnail_url}
                    type={link.type}
                    isEditing={editingId === link.id}
                    editTitle={editTitle}
                    onEditTitleChange={setEditTitle}
                    onStartEdit={() => startEditing(link)}
                    onSaveEdit={saveEdit}
                    onCancelEdit={cancelEdit}
                    onDelete={() => deleteMutation.mutate(link.id)}
                    getThumbnailUrl={getThumbnailUrl}
                    onRemoveThumbnail={link.type !== "image" && link.thumbnail_url ? () => removeThumbnailMutation.mutate(link.id) : undefined}
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

export default TopicResources;
