import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { ResourceCard } from "./ResourceCard";

interface SortableResourceCardProps {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string | null;
  type?: "link" | "image";
  isEditing: boolean;
  editTitle: string;
  onEditTitleChange: (title: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  getThumbnailUrl: (url: string) => string;
  onRemoveThumbnail?: () => void;
}

export const SortableResourceCard = ({
  id,
  onRemoveThumbnail,
  ...props
}: SortableResourceCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <button
        className="cursor-grab p-2 text-muted-foreground hover:text-foreground transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="flex-1">
        <ResourceCard 
          id={id} 
          {...props} 
          onRemoveThumbnail={onRemoveThumbnail}
        />
      </div>
    </div>
  );
};
