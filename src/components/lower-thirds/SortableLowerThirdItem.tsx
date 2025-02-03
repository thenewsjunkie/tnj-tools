import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Pencil, Timer } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { useState } from "react";

interface SortableLowerThirdItemProps {
  lowerThird: Tables<"lower_thirds">;
  onToggleActive: (id: string, isActive: boolean, duration?: number) => void;
  onQuickEdit: (lowerThird: Tables<"lower_thirds">) => void;
}

const SortableLowerThirdItem = ({
  lowerThird,
  onToggleActive,
  onQuickEdit,
}: SortableLowerThirdItemProps) => {
  const [showDurationButtons, setShowDurationButtons] = useState(false);

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

  const handleDurationSelect = (duration: number) => {
    onToggleActive(lowerThird.id, true, duration);
    setShowDurationButtons(false);
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
          {showDurationButtons ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDurationSelect(30)}
              >
                30s
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDurationSelect(60)}
              >
                60s
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDurationSelect(90)}
              >
                90s
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDurationButtons(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowDurationButtons(true)}
                className={lowerThird.is_active ? "text-neon-red" : ""}
              >
                <Timer className="h-4 w-4" />
              </Button>
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
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SortableLowerThirdItem;