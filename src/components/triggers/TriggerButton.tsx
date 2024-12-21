import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TriggerButtonProps {
  title: string;
  onTriggerClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TriggerButton = ({ title, onTriggerClick, onEdit, onDelete }: TriggerButtonProps) => {
  return (
    <div className="flex items-center gap-2 group">
      <Button
        variant="outline"
        className="flex-1 min-w-[120px]"
        onClick={onTriggerClick}
      >
        {title}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TriggerButton;