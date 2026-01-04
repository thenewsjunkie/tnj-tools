import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2, Pencil, Check, Plus, ExternalLink, Link2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeUrl } from "@/lib/url";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Topic } from "./types";
import { TagButton } from "./TagInput";
import { useToast } from "@/hooks/use-toast";

interface TopicCardProps {
  topic: Topic;
  date: string;
  onChange: (topic: Topic) => void;
  onDelete: () => void;
  allTags?: string[];
}

const TopicCard = ({ topic, date, onChange, onDelete, allTags = [] }: TopicCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isLinkType = topic.type === "link";
  const hasContent = topic.title.trim() || topic.links.length > 0 || topic.images.length > 0 || topic.url;
  const [isEditing, setIsEditing] = useState(!hasContent);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Compute normalized URL once for link topics
  const normalizedUrl = isLinkType && topic.url ? normalizeUrl(topic.url) : null;

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleTagsChange = (tags: string[]) => {
    onChange({ ...topic, tags });
  };

  const handleOpenResources = () => {
    navigate(`/admin/topic-resources/${date}/${topic.id}`);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const urlToCopy = normalizedUrl || topic.url || "";
    navigator.clipboard.writeText(urlToCopy);
    toast({ description: "Link copied" });
  };

  const resourceCount = topic.links.length + topic.images.length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-50")}
    >
      <div className={cn("flex items-center gap-2 py-1.5 px-2 rounded-md border border-border/50 bg-card", isLinkType && "border-l-2 border-l-primary/50")}>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </div>

        {isLinkType && (
          <Link2 className="h-3.5 w-3.5 text-primary shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-1">
              <Input
                value={topic.title}
                onChange={(e) => onChange({ ...topic, title: e.target.value })}
                placeholder={isLinkType ? "Link title..." : "Topic title..."}
                className="h-6 text-sm font-medium border-0 bg-transparent px-0 focus-visible:ring-0"
              />
              {isLinkType && (
                <Input
                  value={topic.url || ""}
                  onChange={(e) => onChange({ ...topic, url: e.target.value })}
                  placeholder="https://..."
                  className="h-6 text-xs border-0 bg-transparent px-0 focus-visible:ring-0 text-muted-foreground"
                />
              )}
            </div>
          ) : (
            <div className="min-w-0">
              {isLinkType ? (
                normalizedUrl ? (
                  <a
                    href={normalizedUrl}
                    target="_blank"
                    rel="noopener"
                    className="text-sm font-medium truncate block text-left hover:text-primary hover:underline"
                    title={normalizedUrl}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {topic.title || "Untitled Link"}
                  </a>
                ) : (
                  <span className="text-sm font-medium truncate block text-muted-foreground">
                    {topic.title || "Untitled Link"} (invalid URL)
                  </span>
                )
              ) : (
                <span className="text-sm font-medium truncate block">
                  {topic.title || "Untitled Topic"}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <TagButton
            tags={topic.tags || []}
            onChange={handleTagsChange}
            allTags={allTags}
          />
          
          {isLinkType ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-1.5 text-muted-foreground hover:text-foreground"
                onClick={handleCopyLink}
                title="Copy link"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              {normalizedUrl ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-1.5 text-muted-foreground hover:text-primary"
                  asChild
                >
                  <a
                    href={normalizedUrl}
                    target="_blank"
                    rel="noopener"
                    title="Open link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              ) : null}
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-1.5 text-muted-foreground hover:text-foreground"
              onClick={handleOpenResources}
              title={resourceCount > 0 ? `Resources (${resourceCount})` : "Add Resources"}
            >
              <Plus className="h-3.5 w-3.5" />
              {resourceCount > 0 && (
                <span className="text-xs ml-1">{resourceCount}</span>
              )}
            </Button>
          )}
          
          {isEditing ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-primary hover:text-primary"
              onClick={handleSave}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={handleEdit}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopicCard;
