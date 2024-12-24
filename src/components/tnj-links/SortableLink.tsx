import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import LinkItem from "./LinkItem";
import { GripVertical } from "lucide-react";

interface SortableLinkProps {
  id: string;
  title: string;
  url: string;
  status: string;
  target: string;
  onDelete: () => void;
  onEdit: () => void;
  theme: string;
}

const SortableLink = ({ id, ...props }: SortableLinkProps) => {
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
        className={`cursor-grab p-1 opacity-50 hover:opacity-100 ${props.theme === 'light' ? 'text-black' : 'text-white'}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1">
        <LinkItem {...props} />
      </div>
    </div>
  );
};

export default SortableLink;