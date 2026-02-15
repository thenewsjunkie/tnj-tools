import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaLink } from "@/components/admin/show-prep/types";

interface SortableMediaCardProps {
  link: MediaLink;
  onRemove: (id: string) => void;
}

const SortableMediaCard = ({ link, onRemove }: SortableMediaCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag handle */}
      <button
        className="absolute top-1 left-1 z-10 cursor-grab p-1 rounded bg-background/80 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg overflow-hidden border border-border/50 hover:border-border transition-colors block"
      >
        <div className="aspect-video bg-muted flex items-center justify-center">
          {link.thumbnail ? (
            <img
              src={link.thumbnail}
              alt={link.title || "Video thumbnail"}
              className="w-full h-full object-cover"
            />
          ) : (
            <Video className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        {link.title && (
          <div className="px-2 py-1.5">
            <p className="text-xs text-muted-foreground line-clamp-2">{link.title}</p>
          </div>
        )}
      </a>

      <Button
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(link.id);
        }}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default SortableMediaCard;
