
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tables } from "@/integrations/supabase/types";
import { Edit2, X, ChevronDown, ChevronUp, Hash } from "lucide-react";
import { useState } from "react";
import LowerThirdForm from "./LowerThirdForm";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
    onEdit({
      ...lowerThird,
      ...updatedData,
      logo_url: updatedData.logo_url
    });
    setIsEditing(false);
  };

  return (
    <Card key={lowerThird.id} className="p-4">
      <Collapsible open={isEditing} onOpenChange={setIsEditing}>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-bold">{lowerThird.title}</h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <Hash className="h-4 w-4" />
                <span>{lowerThird.id}</span>
              </div>
            </div>
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <X className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Lower Third</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this lower third? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(lowerThird.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
