import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tables } from "@/integrations/supabase/types";
import { Edit2, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import LowerThirdForm from "./LowerThirdForm";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = (updatedData: Omit<Tables<"lower_thirds">, "id" | "created_at" | "updated_at">) => {
    // Include all fields, including logo_url, in the update
    onEdit({
      ...lowerThird,
      ...updatedData,
      logo_url: updatedData.logo_url // Explicitly include logo_url
    });
    setIsEditing(false);
  };

  return (
    <Card key={lowerThird.id} className="p-4">
      <Collapsible open={isEditing} onOpenChange={setIsEditing}>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="font-bold">{lowerThird.title}</h3>
            <p className="text-sm text-muted-foreground">Type: {lowerThird.type}</p>
            {lowerThird.type === "guest" && lowerThird.guest_image_url && (
              <img 
                src={lowerThird.guest_image_url} 
                alt="Guest" 
                className="w-16 h-16 object-cover rounded-full"
              />
            )}
            {lowerThird.logo_url && (
              <div>
                <p className="text-sm text-muted-foreground">Logo:</p>
                <img 
                  src={lowerThird.logo_url} 
                  alt="Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
            )}
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
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
              >
                {isEditing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(lowerThird.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <CollapsibleContent className="mt-4">
          <LowerThirdForm
            initialData={lowerThird}
            onSubmit={handleEdit}
            submitLabel="Save Changes"
          />
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default LowerThirdItem;