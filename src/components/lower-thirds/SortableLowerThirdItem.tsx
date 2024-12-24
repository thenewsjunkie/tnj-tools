import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Pencil } from "lucide-react";

interface SortableLowerThirdItemProps {
  lowerThird: Tables<"lower_thirds">;
  onToggleActive: (id: string, isActive: boolean) => void;
  onQuickEdit: (lowerThird: Tables<"lower_thirds">) => void;
}

const SortableLowerThirdItem = ({
  lowerThird,
  onToggleActive,
  onQuickEdit,
}: SortableLowerThirdItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lowerThird.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-4 bg-background"
    >
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h3 className="font-bold">{lowerThird.title}</h3>
            <p className="text-sm text-muted-foreground">Type: {lowerThird.type}</p>
            {lowerThird.primary_text && (
              <p className="text-sm">Primary: {lowerThird.primary_text}</p>
            )}
            {lowerThird.secondary_text && (
              <p className="text-sm">Secondary: {lowerThird.secondary_text}</p>
            )}
            {lowerThird.ticker_text && (
              <p className="text-sm">Ticker: {lowerThird.ticker_text}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={lowerThird.is_active}
            onCheckedChange={(checked) => onToggleActive(lowerThird.id, checked)}
            key={`switch-${lowerThird.id}-${lowerThird.is_active}`}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onQuickEdit(lowerThird)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SortableLowerThirdItem;