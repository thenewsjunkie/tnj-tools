import { useState } from "react";
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
import { Tables } from "@/integrations/supabase/types";
import SortableLowerThirdItem from "./SortableLowerThirdItem";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface SortableLowerThirdsProps {
  lowerThirds: Tables<"lower_thirds">[];
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (lowerThird: Tables<"lower_thirds">) => void;
  onQuickEdit: (lowerThird: Tables<"lower_thirds">) => void;
}

const SortableLowerThirds = ({
  lowerThirds,
  onToggleActive,
  onQuickEdit,
}: SortableLowerThirdsProps) => {
  const [items, setItems] = useState(lowerThirds);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      try {
        // Update display_order for affected items
        const updates = newItems.map((item, index) => ({
          ...item,
          display_order: index,
        }));

        const { error } = await supabase
          .from("lower_thirds")
          .upsert(updates, { onConflict: "id" });

        if (error) throw error;

        await queryClient.invalidateQueries({ queryKey: ["lower-thirds"] });

        toast({
          title: "Success",
          description: "Lower third order updated successfully",
        });
      } catch (error) {
        console.error("Error updating order:", error);
        toast({
          title: "Error",
          description: "Failed to update lower third order",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => ({ id: item.id }))}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {items.map((lowerThird) => (
            <SortableLowerThirdItem
              key={lowerThird.id}
              lowerThird={lowerThird}
              onToggleActive={onToggleActive}
              onQuickEdit={onQuickEdit}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SortableLowerThirds;