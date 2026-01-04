import { useState, useEffect, useRef } from "react";
import { format, addDays } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Link2, Loader2, GripVertical, X, Unlink, Pencil, Check, FolderPlus, FileText, CalendarArrowDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";
import CreateTopicDialog from "./CreateTopicDialog";
import { HourBlock, Topic, Link, Bullet, DEFAULT_SHOW_HOURS } from "./types";

interface HopperItem {
  id: string;
  date: string;
  url: string;
  title: string | null;
  thumbnail_url: string | null;
  group_id: string | null;
  display_order: number;
}

interface HopperGroup {
  id: string;
  date: string;
  name: string | null;
  display_order: number;
}

interface HopperProps {
  selectedDate: Date;
}

const SortableHopperItem = ({
  item,
  onDelete,
  onUngroup,
  isSelected,
  onSelect,
}: {
  item: HopperItem;
  onDelete: (id: string) => void;
  onUngroup?: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string, isMulti: boolean) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hostname = (() => {
    try {
      return new URL(item.url).hostname;
    } catch {
      return item.url;
    }
  })();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 rounded-lg bg-card border transition-colors ${
        isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
      }`}
      onClick={(e) => onSelect(item.id, e.ctrlKey || e.metaKey)}
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      {item.thumbnail_url && (
        <img
          src={item.thumbnail_url}
          alt=""
          className="w-12 h-8 object-cover rounded flex-shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
      <div className="flex-1 min-w-0">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-foreground hover:text-primary truncate block"
          onClick={(e) => e.stopPropagation()}
        >
          {item.title || "Untitled"}
        </a>
        <p className="text-xs text-muted-foreground truncate">{hostname}</p>
      </div>
      <div className="flex items-center gap-1">
        {onUngroup && item.group_id && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onUngroup(item.id);
            }}
          >
            <Unlink className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

const GroupedItems = ({
  groupId,
  groupName,
  items,
  onDeleteItem,
  onUngroupItem,
  onDeleteGroup,
  onRenameGroup,
  selectedIds,
  onSelect,
  onSelectAll,
}: {
  groupId: string;
  groupName: string | null;
  items: HopperItem[];
  onDeleteItem: (id: string) => void;
  onUngroupItem: (id: string) => void;
  onDeleteGroup: (id: string) => void;
  onRenameGroup: (id: string, name: string) => void;
  selectedIds: Set<string>;
  onSelect: (id: string, isMulti: boolean) => void;
  onSelectAll: (itemIds: string[], selected: boolean) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(groupName || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onRenameGroup(groupId, editName.trim());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditName(groupName || "");
      setIsEditing(false);
    }
  };

  const allSelected = items.length > 0 && items.every(item => selectedIds.has(item.id));
  const someSelected = items.some(item => selectedIds.has(item.id));

  return (
    <div className="border border-primary/30 rounded-lg p-2 bg-primary/5">
      <div className="flex items-center justify-between mb-2 px-1 gap-2">
        <Checkbox
          checked={allSelected}
          className={someSelected && !allSelected ? "opacity-50" : ""}
          onCheckedChange={(checked) => {
            onSelectAll(items.map(i => i.id), !!checked);
          }}
        />
        {isEditing ? (
          <div className="flex items-center gap-1 flex-1">
            <Input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              placeholder="Group name..."
              className="h-6 text-xs py-0"
            />
          </div>
        ) : (
          <button
            onClick={() => {
              setEditName(groupName || "");
              setIsEditing(true);
            }}
            className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 group"
          >
            {groupName || `Group (${items.length} items)`}
            <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground hover:text-destructive flex-shrink-0"
          onClick={() => onDeleteGroup(groupId)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <SortableHopperItem
            key={item.id}
            item={item}
            onDelete={onDeleteItem}
            onUngroup={onUngroupItem}
            isSelected={selectedIds.has(item.id)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

const Hopper = ({ selectedDate }: HopperProps) => {
  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newUrls, setNewUrls] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreateTopicDialogOpen, setIsCreateTopicDialogOpen] = useState(false);

  // Clear selections when date changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [dateKey]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch hopper items for the date
  const { data: items = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ["hopper-items", dateKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hopper_items")
        .select("*")
        .eq("date", dateKey)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as HopperItem[];
    },
  });

  // Fetch hopper groups for the date
  const { data: groups = [] } = useQuery({
    queryKey: ["hopper-groups", dateKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hopper_groups")
        .select("*")
        .eq("date", dateKey)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as HopperGroup[];
    },
  });

  // Subscribe to realtime changes for hopper_items
  useEffect(() => {
    const channel = supabase
      .channel(`hopper-items-${dateKey}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hopper_items',
          filter: `date=eq.${dateKey}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["hopper-items", dateKey] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dateKey, queryClient]);

  // Subscribe to realtime changes for hopper_groups
  useEffect(() => {
    const channel = supabase
      .channel(`hopper-groups-${dateKey}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hopper_groups',
          filter: `date=eq.${dateKey}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["hopper-groups", dateKey] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dateKey, queryClient]);

  // Add items mutation
  const addMutation = useMutation({
    mutationFn: async (urls: string[]) => {
      const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.display_order)) : -1;

      const newItems = await Promise.all(
        urls.map(async (url, index) => {
          let processedUrl = url.trim();
          if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
            processedUrl = "https://" + processedUrl;
          }

          // Fetch metadata
          let title = null;
          let thumbnailUrl = null;
          try {
            const { data } = await supabase.functions.invoke("fetch-link-metadata", {
              body: { url: processedUrl },
            });
            title = data?.title || null;
            thumbnailUrl = data?.ogImage || null;
          } catch (e) {
            console.error("Failed to fetch metadata:", e);
          }

          return {
            date: dateKey,
            url: processedUrl,
            title,
            thumbnail_url: thumbnailUrl,
            display_order: maxOrder + 1 + index,
          };
        })
      );

      const { error } = await supabase.from("hopper_items").insert(newItems);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hopper-items", dateKey] });
      setNewUrls("");
      setIsAdding(false);
      toast({ title: "Items added to hopper" });
    },
    onError: () => {
      toast({ title: "Failed to add items", variant: "destructive" });
    },
  });

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("hopper_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hopper-items", dateKey] });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("hopper_items").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hopper-items", dateKey] });
      setSelectedIds(new Set());
      toast({ title: "Items deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete items", variant: "destructive" });
    },
  });

  // Clear all mutation
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      // Delete all items for this date
      const { error: itemsError } = await supabase
        .from("hopper_items")
        .delete()
        .eq("date", dateKey);
      if (itemsError) throw itemsError;

      // Delete all groups for this date
      const { error: groupsError } = await supabase
        .from("hopper_groups")
        .delete()
        .eq("date", dateKey);
      if (groupsError) throw groupsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hopper-items", dateKey] });
      queryClient.invalidateQueries({ queryKey: ["hopper-groups", dateKey] });
      setSelectedIds(new Set());
      toast({ title: "Hopper cleared" });
    },
    onError: () => {
      toast({ title: "Failed to clear hopper", variant: "destructive" });
    },
  });

  // Add to Resources mutation
  const addToResourcesMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const selectedItems = items.filter((i) => ids.includes(i.id));
      
      // Get current max order from video_resources
      const { data: existingResources } = await supabase
        .from("video_resources")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1);
      
      const maxOrder = existingResources?.[0]?.display_order ?? -1;
      
      const newResources = selectedItems.map((item, index) => ({
        title: item.title || "Untitled",
        url: item.url,
        thumbnail_url: item.thumbnail_url,
        display_order: maxOrder + 1 + index,
        type: "link" as const,
      }));
      
      const { error } = await supabase.from("video_resources").insert(newResources);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-resources"] });
      setSelectedIds(new Set());
      toast({ title: "Added to Resources" });
    },
    onError: () => {
      toast({ title: "Failed to add to Resources", variant: "destructive" });
    },
  });

  // Create topic mutation
  const createTopicMutation = useMutation({
    mutationFn: async ({
      title,
      hourId,
      addToResources,
      removeFromHopper,
      itemIds,
    }: {
      title: string;
      hourId: string;
      addToResources: boolean;
      removeFromHopper: boolean;
      itemIds: string[];
    }) => {
      const selectedItems = items.filter((i) => itemIds.includes(i.id));
      
      // Convert hopper items to topic links
      const topicLinks: Link[] = selectedItems.map((item) => ({
        id: uuidv4(),
        url: item.url,
        title: item.title || undefined,
        thumbnail_url: item.thumbnail_url || undefined,
        type: "link" as const,
      }));

      // Create the new topic
      const newTopic: Topic = {
        id: uuidv4(),
        title,
        display_order: 0,
        bullets: [{ id: uuidv4(), text: "", indent: 0 }],
        links: topicLinks,
        images: [],
      };

      // Fetch existing show prep notes
      const { data: existingData, error: fetchError } = await supabase
        .from("show_prep_notes")
        .select("*")
        .eq("date", dateKey)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let hours: HourBlock[];
      let noteId: string | null = existingData?.id || null;

      if (existingData) {
        // Parse existing hours
        const rawData = existingData.topics as unknown;
        if (rawData && typeof rawData === "object" && Array.isArray((rawData as { hours?: unknown }).hours)) {
          hours = (rawData as { hours: HourBlock[] }).hours;
        } else {
          // Legacy format or empty - create default structure
          hours = [
            { id: "hour-1", startTime: "11:00 AM", endTime: "12:00 PM", label: "Hour 1", topics: [] },
            { id: "hour-2", startTime: "12:00 PM", endTime: "1:00 PM", label: "Hour 2", topics: [] },
            { id: "hour-3", startTime: "1:00 PM", endTime: "2:00 PM", label: "Hour 3", topics: [] },
            { id: "hour-4", startTime: "2:00 PM", endTime: "3:00 PM", label: "Hour 4", topics: [] },
          ];
        }
      } else {
        // No existing data - create default structure
        hours = [
          { id: "hour-1", startTime: "11:00 AM", endTime: "12:00 PM", label: "Hour 1", topics: [] },
          { id: "hour-2", startTime: "12:00 PM", endTime: "1:00 PM", label: "Hour 2", topics: [] },
          { id: "hour-3", startTime: "1:00 PM", endTime: "2:00 PM", label: "Hour 3", topics: [] },
          { id: "hour-4", startTime: "2:00 PM", endTime: "3:00 PM", label: "Hour 4", topics: [] },
        ];
      }

      // Find the target hour and add the topic
      const updatedHours = hours.map((hour) => {
        if (hour.id === hourId) {
          const updatedTopic = { ...newTopic, display_order: hour.topics.length };
          return { ...hour, topics: [...hour.topics, updatedTopic] };
        }
        return hour;
      });

      // Save to database
      const hoursJson = JSON.parse(JSON.stringify({ hours: updatedHours }));
      
      if (noteId) {
        const { error: updateError } = await supabase
          .from("show_prep_notes")
          .update({ topics: hoursJson })
          .eq("id", noteId);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("show_prep_notes")
          .insert([{ date: dateKey, topics: hoursJson }]);
        if (insertError) throw insertError;
      }

      // Optionally add to Resources
      if (addToResources) {
        const { data: existingResources } = await supabase
          .from("video_resources")
          .select("display_order")
          .order("display_order", { ascending: false })
          .limit(1);

        const maxOrder = existingResources?.[0]?.display_order ?? -1;

        const newResources = selectedItems.map((item, index) => ({
          title: item.title || "Untitled",
          url: item.url,
          thumbnail_url: item.thumbnail_url,
          display_order: maxOrder + 1 + index,
          type: "link" as const,
        }));

        const { error: resourceError } = await supabase.from("video_resources").insert(newResources);
        if (resourceError) throw resourceError;
      }

      // Optionally remove from hopper
      if (removeFromHopper) {
        const { error: deleteError } = await supabase
          .from("hopper_items")
          .delete()
          .in("id", itemIds);
        if (deleteError) throw deleteError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["show-prep-notes", dateKey] });
      queryClient.invalidateQueries({ queryKey: ["video-resources"] });
      queryClient.invalidateQueries({ queryKey: ["hopper-items", dateKey] });
      setSelectedIds(new Set());
      setIsCreateTopicDialogOpen(false);
      toast({ title: "Topic created" });
    },
    onError: () => {
      toast({ title: "Failed to create topic", variant: "destructive" });
    },
  });

  // Add a single link directly to an hour (bypasses CreateTopicDialog)
  const addLinkToHourMutation = useMutation({
    mutationFn: async ({
      item,
      hourId,
      removeFromHopper,
    }: {
      item: HopperItem;
      hourId: string;
      removeFromHopper: boolean;
    }) => {
      // Create a Link Topic (type: 'link') - minimal, just the link reference
      const newTopic: Topic = {
        id: uuidv4(),
        title: item.title || "Untitled",
        display_order: 0,
        bullets: [],
        links: [],
        images: [],
        type: 'link',
        url: item.url,
      };

      // Fetch existing show prep notes
      const { data: existingData, error: fetchError } = await supabase
        .from("show_prep_notes")
        .select("*")
        .eq("date", dateKey)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let hours: HourBlock[];
      let noteId: string | null = existingData?.id || null;

      if (existingData) {
        const rawData = existingData.topics as unknown;
        if (rawData && typeof rawData === "object" && Array.isArray((rawData as { hours?: unknown }).hours)) {
          hours = (rawData as { hours: HourBlock[] }).hours;
        } else {
          hours = DEFAULT_SHOW_HOURS.map(h => ({ ...h, topics: [] }));
        }
      } else {
        hours = DEFAULT_SHOW_HOURS.map(h => ({ ...h, topics: [] }));
      }

      // Find the target hour and add the topic
      const updatedHours = hours.map((hour) => {
        if (hour.id === hourId) {
          const updatedTopic = { ...newTopic, display_order: hour.topics.length };
          return { ...hour, topics: [...hour.topics, updatedTopic] };
        }
        return hour;
      });

      // Save to database
      const hoursJson = JSON.parse(JSON.stringify({ hours: updatedHours }));

      if (noteId) {
        const { error: updateError } = await supabase
          .from("show_prep_notes")
          .update({ topics: hoursJson })
          .eq("id", noteId);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("show_prep_notes")
          .insert([{ date: dateKey, topics: hoursJson }]);
        if (insertError) throw insertError;
      }

      // Remove from hopper
      if (removeFromHopper) {
        const { error: deleteError } = await supabase
          .from("hopper_items")
          .delete()
          .eq("id", item.id);
        if (deleteError) throw deleteError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["show-prep-notes", dateKey] });
      queryClient.invalidateQueries({ queryKey: ["hopper-items", dateKey] });
      setSelectedIds(new Set());
      toast({ title: "Link added to hour" });
    },
    onError: () => {
      toast({ title: "Failed to add link", variant: "destructive" });
    },
  });

  const groupMutation = useMutation({
    mutationFn: async (itemIds: string[]) => {
      // Create a new group
      const { data: groupData, error: groupError } = await supabase
        .from("hopper_groups")
        .insert({
          date: dateKey,
          display_order: groups.length,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Update items with the group id
      const { error: updateError } = await supabase
        .from("hopper_items")
        .update({ group_id: groupData.id })
        .in("id", itemIds);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hopper-items", dateKey] });
      queryClient.invalidateQueries({ queryKey: ["hopper-groups", dateKey] });
      setSelectedIds(new Set());
      toast({ title: "Items grouped" });
    },
  });

  // Save selected for tomorrow (move to next day, delete rest)
  const saveForTomorrowMutation = useMutation({
    mutationFn: async (keepItemIds: string[]) => {
      const tomorrowDate = format(addDays(selectedDate, 1), "yyyy-MM-dd");
      const deleteItemIds = items.filter((i) => !keepItemIds.includes(i.id)).map((i) => i.id);

      // Find groups that contain items being kept
      const groupIdsToMove = new Set<string>();
      items
        .filter((i) => keepItemIds.includes(i.id) && i.group_id)
        .forEach((i) => groupIdsToMove.add(i.group_id!));

      // Move selected items to tomorrow
      if (keepItemIds.length > 0) {
        const { error: updateError } = await supabase
          .from("hopper_items")
          .update({ date: tomorrowDate })
          .in("id", keepItemIds);
        if (updateError) throw updateError;
      }

      // Move groups that have items being moved
      if (groupIdsToMove.size > 0) {
        const { error: groupError } = await supabase
          .from("hopper_groups")
          .update({ date: tomorrowDate })
          .in("id", Array.from(groupIdsToMove));
        if (groupError) throw groupError;
      }

      // Delete the rest
      if (deleteItemIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("hopper_items")
          .delete()
          .in("id", deleteItemIds);
        if (deleteError) throw deleteError;
      }
    },
    onSuccess: () => {
      const tomorrowDateKey = format(addDays(selectedDate, 1), "yyyy-MM-dd");
      queryClient.invalidateQueries({ queryKey: ["hopper-items", dateKey] });
      queryClient.invalidateQueries({ queryKey: ["hopper-items", tomorrowDateKey] });
      queryClient.invalidateQueries({ queryKey: ["hopper-groups", dateKey] });
      queryClient.invalidateQueries({ queryKey: ["hopper-groups", tomorrowDateKey] });
      setSelectedIds(new Set());
      toast({ title: "Selected items saved for tomorrow, others deleted" });
    },
    onError: () => {
      toast({ title: "Failed to save items", variant: "destructive" });
    },
  });

  // Ungroup item mutation
  const ungroupMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from("hopper_items")
        .update({ group_id: null })
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hopper-items", dateKey] });
    },
  });

  // Delete group mutation (ungroups all items in it)
  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      // First ungroup all items
      const { error: ungroupError } = await supabase
        .from("hopper_items")
        .update({ group_id: null })
        .eq("group_id", groupId);
      if (ungroupError) throw ungroupError;

      // Then delete the group
      const { error } = await supabase.from("hopper_groups").delete().eq("id", groupId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hopper-items", dateKey] });
      queryClient.invalidateQueries({ queryKey: ["hopper-groups", dateKey] });
    },
  });

  // Add items to existing group mutation
  const addToGroupMutation = useMutation({
    mutationFn: async ({ itemIds, groupId }: { itemIds: string[]; groupId: string }) => {
      const { error } = await supabase
        .from("hopper_items")
        .update({ group_id: groupId })
        .in("id", itemIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hopper-items", dateKey] });
      setSelectedIds(new Set());
      toast({ title: "Items added to group" });
    },
  });

  // Rename group mutation
  const renameGroupMutation = useMutation({
    mutationFn: async ({ groupId, name }: { groupId: string; name: string }) => {
      const { error } = await supabase
        .from("hopper_groups")
        .update({ name: name || null })
        .eq("id", groupId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hopper-groups", dateKey] });
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (newItems: HopperItem[]) => {
      const updates = newItems.map((item, index) => ({
        id: item.id,
        date: item.date,
        url: item.url,
        title: item.title,
        thumbnail_url: item.thumbnail_url,
        group_id: item.group_id,
        display_order: index,
      }));

      const { error } = await supabase.from("hopper_items").upsert(updates, { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hopper-items", dateKey] });
    },
  });

  const handleAddUrls = () => {
    const urls = newUrls
      .split(/\s+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0 && (u.startsWith('http://') || u.startsWith('https://') || u.includes('.')));

    if (urls.length > 0) {
      setIsFetching(true);
      addMutation.mutate(urls, {
        onSettled: () => setIsFetching(false),
      });
    }
  };

  const handleSelect = (id: string, isMulti: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      // Always toggle - no need for Ctrl/Cmd
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = (itemIds: string[], selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        itemIds.forEach(id => next.add(id));
      } else {
        itemIds.forEach(id => next.delete(id));
      }
      return next;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const ungroupedItems = items.filter((i) => !i.group_id);
      const oldIndex = ungroupedItems.findIndex((i) => i.id === active.id);
      const newIndex = ungroupedItems.findIndex((i) => i.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newUngrouped = arrayMove(ungroupedItems, oldIndex, newIndex);
        // Merge with grouped items maintaining their order
        const groupedItems = items.filter((i) => i.group_id);
        reorderMutation.mutate([...newUngrouped, ...groupedItems]);
      }
    }
  };

  // Get ungrouped items and grouped items
  const ungroupedItems = items.filter((i) => !i.group_id);
  const groupedItemsMap = new Map<string, HopperItem[]>();
  items
    .filter((i) => i.group_id)
    .forEach((item) => {
      const existing = groupedItemsMap.get(item.group_id!) || [];
      groupedItemsMap.set(item.group_id!, [...existing, item]);
    });

  const canGroup = selectedIds.size >= 2;

  // Compute default topic title from group name if all selected items are in the same group
  const getDefaultTopicTitle = (): string => {
    if (selectedIds.size === 0) return "";
    const selectedItems = items.filter(i => selectedIds.has(i.id));
    const groupIds = new Set(selectedItems.map(i => i.group_id).filter(Boolean));
    if (groupIds.size === 1) {
      const groupId = Array.from(groupIds)[0];
      const group = groups.find(g => g.id === groupId);
      return group?.name || "";
    }
    return "";
  };
  return (
    <div className="space-y-4">
      {/* Add URL input */}
      <div className="flex gap-2">
        {isAdding ? (
          <div className="flex-1 space-y-2">
            <Textarea
              value={newUrls}
              onChange={(e) => setNewUrls(e.target.value)}
              placeholder="Paste URLs (one per line)"
              className="text-sm min-h-[80px] resize-y"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddUrls}
                disabled={!newUrls.trim() || isFetching}
              >
                {isFetching ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add"
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAdding(false);
                  setNewUrls("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            size="sm" 
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Links
          </Button>
        )}

        {selectedIds.size >= 1 && (() => {
          // Check if single ungrouped item is selected
          const selectedItemsArray = items.filter(i => selectedIds.has(i.id));
          const isSingleUngroupedItem = selectedIds.size === 1 && selectedItemsArray[0]?.group_id === null;
          const selectedItem = selectedItemsArray[0];

          return (
            <>
              {/* For single ungrouped item - Add directly as link */}
              {isSingleUngroupedItem && selectedItem && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" disabled={addLinkToHourMutation.isPending}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add to Hour
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {DEFAULT_SHOW_HOURS.map((hour) => (
                      <DropdownMenuItem
                        key={hour.id}
                        onClick={() => addLinkToHourMutation.mutate({
                          item: selectedItem,
                          hourId: hour.id,
                          removeFromHopper: true,
                        })}
                      >
                        {hour.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* For groups or multiple items - Create Topic */}
              {!isSingleUngroupedItem && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCreateTopicDialogOpen(true)}
                  disabled={createTopicMutation.isPending}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Create Topic
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => addToResourcesMutation.mutate(Array.from(selectedIds))}
                disabled={addToResourcesMutation.isPending}
              >
                <FolderPlus className="h-4 w-4 mr-1" />
                To Resources
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive border-destructive hover:bg-destructive/10"
                onClick={() => bulkDeleteMutation.mutate(Array.from(selectedIds))}
                disabled={bulkDeleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete ({selectedIds.size})
              </Button>
            </>
          );
        })()}

        {canGroup && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => groupMutation.mutate(Array.from(selectedIds))}
          >
            <Link2 className="h-4 w-4 mr-1" />
            Group ({selectedIds.size})
          </Button>
        )}

        {/* Add to existing group */}
        {(() => {
          const selectedUngroupedItems = Array.from(selectedIds).filter(
            (id) => items.find((item) => item.id === id)?.group_id === null
          );
          const canAddToGroup = selectedUngroupedItems.length > 0 && groups.length > 0;
          
          return canAddToGroup ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <FolderPlus className="h-4 w-4 mr-1" />
                  Add to Group
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {groups.map((group) => (
                  <DropdownMenuItem
                    key={group.id}
                    onClick={() => addToGroupMutation.mutate({
                      itemIds: selectedUngroupedItems,
                      groupId: group.id,
                    })}
                  >
                    {group.name || `Group (${items.filter(i => i.group_id === group.id).length} items)`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null;
        })()}

        {/* Save for Tomorrow - move selected to next day, delete rest */}
        {selectedIds.size >= 1 && items.length > 1 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                disabled={saveForTomorrowMutation.isPending}
              >
                <CalendarArrowDown className="h-4 w-4 mr-1" />
                Save for Tomorrow
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Save selected items for tomorrow?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will move {selectedIds.size} selected item{selectedIds.size > 1 ? "s" : ""} to tomorrow and delete the remaining {items.length - selectedIds.size} item{items.length - selectedIds.size !== 1 ? "s" : ""}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => saveForTomorrowMutation.mutate(Array.from(selectedIds))}
                >
                  Save for Tomorrow
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Item count and clear all */}
        {items.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {items.length} items
            </span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                  disabled={clearAllMutation.isPending}
                >
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all hopper items?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {items.length} items from the hopper. This action cannot be undone.
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
          </div>
        )}
      </div>

      {/* Scrollable items list */}
      {isLoadingItems ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-center py-8 text-sm">
          No items in the hopper yet. Add links or use "Add to Hopper" from Resources pages.
        </p>
      ) : (
        <div className="max-h-[400px] overflow-y-auto pr-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-2">
              {/* Grouped items */}
              {Array.from(groupedItemsMap.entries()).map(([groupId, groupItems]) => {
                const group = groups.find((g) => g.id === groupId);
                return (
                  <GroupedItems
                    key={groupId}
                    groupId={groupId}
                    groupName={group?.name || null}
                    items={groupItems}
                    onDeleteItem={(id) => deleteMutation.mutate(id)}
                    onUngroupItem={(id) => ungroupMutation.mutate(id)}
                    onDeleteGroup={(id) => deleteGroupMutation.mutate(id)}
                    onRenameGroup={(id, name) => renameGroupMutation.mutate({ groupId: id, name })}
                    selectedIds={selectedIds}
                    onSelect={handleSelect}
                    onSelectAll={handleSelectAll}
                  />
                );
              })}

              {/* Ungrouped items */}
              <SortableContext
                items={ungroupedItems.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {ungroupedItems.map((item) => (
                    <SortableHopperItem
                      key={item.id}
                      item={item}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      isSelected={selectedIds.has(item.id)}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>

            <DragOverlay>
              {activeId ? (
                <div className="p-2 rounded-lg bg-card border border-primary shadow-lg">
                  {items.find((i) => i.id === activeId)?.title || "Item"}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {selectedIds.size > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {selectedIds.size} selected • Ctrl/Cmd+click to multi-select
        </p>
      )}

      <CreateTopicDialog
        open={isCreateTopicDialogOpen}
        onOpenChange={setIsCreateTopicDialogOpen}
        onConfirm={(data) => {
          createTopicMutation.mutate({
            ...data,
            itemIds: Array.from(selectedIds),
          });
        }}
        itemCount={selectedIds.size}
        isGroup={selectedIds.size > 1}
        defaultTitle={getDefaultTopicTitle()}
      />
    </div>
  );
};

export default Hopper;