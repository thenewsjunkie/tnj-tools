import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Link2, Loader2, GripVertical, X, Unlink, Pencil, Check } from "lucide-react";
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

  return (
    <div className="border border-primary/30 rounded-lg p-2 bg-primary/5">
      <div className="flex items-center justify-between mb-2 px-1 gap-2">
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

  // Group selected items mutation
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
      .split(/[\n,]/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

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
      if (isMulti) {
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
      } else {
        if (next.has(id) && next.size === 1) {
          next.clear();
        } else {
          next.clear();
          next.add(id);
        }
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

  return (
    <div className="space-y-4">
      {/* Add URL input */}
      <div className="flex gap-2">
        {isAdding ? (
          <div className="flex-1 space-y-2">
            <Input
              value={newUrls}
              onChange={(e) => setNewUrls(e.target.value)}
              placeholder="Paste URLs (one per line or comma-separated)"
              className="text-sm"
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
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Links
          </Button>
        )}

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
      </div>

      {/* Items list */}
      {isLoadingItems ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-center py-8 text-sm">
          No items in the hopper yet. Add links or use "Add to Hopper" from Resources pages.
        </p>
      ) : (
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
      )}

      {selectedIds.size > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {selectedIds.size} selected • Ctrl/Cmd+click to multi-select
        </p>
      )}
    </div>
  );
};

export default Hopper;