import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X, Image as ImageIcon } from "lucide-react";

interface ResourceCardProps {
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
}

export const ResourceCard = ({
  id,
  title,
  url,
  thumbnailUrl,
  type = "link",
  isEditing,
  editTitle,
  onEditTitleChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  getThumbnailUrl,
}: ResourceCardProps) => {
  const isImage = type === "image";
  
  const displayHostname = () => {
    if (isImage) {
      return "Image";
    }
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const thumbnailSrc = isImage 
    ? url 
    : (thumbnailUrl || getThumbnailUrl(url));

  return (
    <div className="group flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
      {/* Thumbnail */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 w-40 h-24 rounded overflow-hidden bg-muted relative"
      >
        <img
          src={thumbnailSrc}
          alt=""
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        {isImage && (
          <div className="absolute bottom-1 right-1 p-1 bg-black/60 rounded">
            <ImageIcon className="h-3 w-3 text-white" />
          </div>
        )}
      </a>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveEdit();
                if (e.key === "Escape") onCancelEdit();
              }}
              autoFocus
              className="text-lg"
            />
            <Button size="icon" variant="ghost" onClick={onSaveEdit}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onCancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xl font-medium text-foreground hover:text-primary transition-colors truncate"
          >
            {title || "Untitled"}
          </a>
        )}
        <p className="text-sm text-muted-foreground truncate mt-1">
          {displayHostname()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={onStartEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
