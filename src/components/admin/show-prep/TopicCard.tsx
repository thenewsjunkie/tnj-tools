import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2, Pencil, Check, Plus, ExternalLink, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeUrl } from "@/lib/url";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Topic } from "./types";
import { TagButton } from "./TagInput";

interface TopicCardProps {
  topic: Topic;
  date: string;
  onChange: (topic: Topic) => void;
  onDelete: () => void;
  allTags?: string[];
}

const TopicCard = ({ topic, date, onChange, onDelete, allTags = [] }: TopicCardProps) => {
  const navigate = useNavigate();
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

  const handleOpenLink = () => {
    if (topic.url) {
      // Normalize URL at click-time to handle existing data without protocol
      const normalizedUrl = normalizeUrl(topic.url);
      if (normalizedUrl) {
        window.open(normalizedUrl, "_blank", "noopener,noreferrer");
      }
    }
  };

  const resourceCount = topic.links.length + topic.images.length;

  // Extract hostname for display
  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-50")}
    >
      <Card className={cn("border-border/50", isLinkType && "border-l-2 border-l-primary/50")}>
        <CardHeader className="py-2 px-3">
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>

            {isLinkType && (
              <Link2 className="h-4 w-4 text-primary shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={topic.title}
                    onChange={(e) => onChange({ ...topic, title: e.target.value })}
                    placeholder={isLinkType ? "Link title..." : "Topic title..."}
                    className="h-7 text-sm font-medium border-0 bg-transparent px-0 focus-visible:ring-0"
                  />
                  {isLinkType && (
                    <Input
                      value={topic.url || ""}
                      onChange={(e) => onChange({ ...topic, url: e.target.value })}
                      placeholder="https://..."
                      className="h-7 text-xs border-0 bg-transparent px-0 focus-visible:ring-0 text-muted-foreground"
                    />
                  )}
                </div>
              ) : (
                <div className="min-w-0">
                  {isLinkType ? (
                    <button
                      onClick={handleOpenLink}
                      className="text-sm font-medium truncate block text-left hover:text-primary hover:underline cursor-pointer"
                      title={topic.url}
                    >
                      {topic.title || "Untitled Link"}
                    </button>
                  ) : (
                    <span className="text-sm font-medium truncate block">
                      {topic.title || "Untitled Topic"}
                    </span>
                  )}
                  {isLinkType && topic.url && (
                    <span className="text-xs text-muted-foreground truncate block">
                      {getHostname(topic.url)}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <TagButton
                tags={topic.tags || []}
                onChange={handleTagsChange}
                allTags={allTags}
              />
              
              {isLinkType ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-muted-foreground hover:text-primary"
                  onClick={handleOpenLink}
                  title="Open link"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-muted-foreground hover:text-foreground"
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
                  className="h-7 w-7 p-0 text-primary hover:text-primary"
                  onClick={handleSave}
                >
                  <Check className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={handleEdit}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default TopicCard;
