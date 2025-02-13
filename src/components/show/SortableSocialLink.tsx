
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";

interface SortableSocialLinkProps {
  id: string;
  url: string;
  platform: string;
  platformLabel: string;
  onUrlChange: (url: string) => void;
  onRemove: () => void;
}

export default function SortableSocialLink({
  id,
  url,
  platform,
  platformLabel,
  onUrlChange,
  onRemove
}: SortableSocialLinkProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <button
        className="cursor-grab p-2 text-gray-400 hover:text-white"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Input
        placeholder={`${platformLabel} URL`}
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        className="flex-1"
      />
      <Button
        variant="destructive"
        size="icon"
        onClick={onRemove}
        title={`Remove ${platformLabel}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
