import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Pencil, X } from "lucide-react";

interface SortableLowerThirdItemProps {
  lowerThird: Tables<"lower_thirds">;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (lowerThird: Tables<"lower_thirds">) => void;
  onQuickEdit: (lowerThird: Tables<"lower_thirds">) => void;
}

const SortableLowerThirdItem = ({
  lowerThird,
  onToggleActive,
  onDelete,
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
      className="p-4 cursor-move bg-background"
    >
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="font-bold">{lowerThird.title}</h3>
            <p className="text-sm text-muted-foreground">Type: {lowerThird.type}</p>
            {lowerThird.type === "guest" && lowerThird.guest_image_url && (
              <img
                src={lowerThird.guest_image_url}
                alt="Guest"
                className="w-16 h-16 object-cover rounded-full mt-2"
              />
            )}
            {lowerThird.logo_url && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">Logo:</p>
                <img
                  src={lowerThird.logo_url}
                  alt="Logo"
                  className="w-16 h-16 object-contain"
                />
              </div>
            )}
            {lowerThird.primary_text && (
              <p className="text-sm mt-2">Primary: {lowerThird.primary_text}</p>
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
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onQuickEdit(lowerThird)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(lowerThird.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SortableLowerThirdItem;