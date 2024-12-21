import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TriggerButton } from "./TriggerButton";

interface Trigger {
  id: string;
  title: string;
  link: string;
}

interface TriggerListProps {
  triggers: Trigger[];
  onTriggerClick: (link: string) => void;
  onEditClick: (trigger: Trigger) => void;
  onDeleteClick: (id: string) => void;
}

export const TriggerList = ({
  triggers,
  onTriggerClick,
  onEditClick,
  onDeleteClick,
}: TriggerListProps) => {
  if (triggers.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        No triggers added yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {triggers.map((trigger) => (
        <div key={trigger.id} className="flex items-center gap-1">
          <TriggerButton
            title={trigger.title}
            onClick={() => onTriggerClick(trigger.link)}
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEditClick(trigger)}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDeleteClick(trigger.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
};