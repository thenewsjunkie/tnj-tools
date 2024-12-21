import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

interface TriggerButtonProps {
  title: string;
  onTriggerClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TriggerButton = ({ title, onTriggerClick, onEdit, onDelete }: TriggerButtonProps) => {
  return (
    <div className="flex gap-2 items-center">
      <Button
        variant="outline"
        className="min-w-[100px]"
        onClick={onTriggerClick}
      >
        {title}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onEdit}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onDelete}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TriggerButton;