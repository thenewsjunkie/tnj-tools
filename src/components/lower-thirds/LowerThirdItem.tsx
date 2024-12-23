import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tables } from "@/integrations/supabase/types";
import { Edit2, X } from "lucide-react";

interface LowerThirdItemProps {
  lowerThird: Tables<"lower_thirds">;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (lowerThird: Tables<"lower_thirds">) => void;
}

const LowerThirdItem = ({
  lowerThird,
  onToggleActive,
  onDelete,
  onEdit,
}: LowerThirdItemProps) => {
  return (
    <Card key={lowerThird.id} className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
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
        <div className="flex items-center space-x-2">
          <Switch
            checked={lowerThird.is_active}
            onCheckedChange={(checked) =>
              onToggleActive(lowerThird.id, checked)
            }
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(lowerThird)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(lowerThird.id)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LowerThirdItem;