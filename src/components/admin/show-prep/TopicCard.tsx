import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2, Pencil, Check, Plus, ExternalLink, Link2, Copy, Flame, MoreHorizontal, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeUrl } from "@/lib/url";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Topic } from "./types";
import { TagButton } from "./TagInput";
import { StrongmanButton } from "./StrongmanButton";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [takeOpen, setTakeOpen] = useState(false);
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
    window.open(`/admin/topic-resources/${date}/${topic.id}`, '_blank');
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const urlToCopy = normalizedUrl || topic.url || "";
    navigator.clipboard.writeText(urlToCopy);
    toast({ description: "Link copied" });
  };

  const handleTakeChange = (take: string) => {
    onChange({ ...topic, take });
  };

  const resourceCount = topic.links.length + topic.images.length;
  const hasTake = !!topic.take?.trim();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-50")}
    >
      <div className={cn("flex flex-col gap-1 py-1.5 px-2 rounded-md border border-border/50 bg-card", isLinkType && "border-l-2 border-l-primary/50")}>
        <div className="flex items-center gap-2">
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
            <StrongmanButton
              topic={topic}
              onChange={(strongman) => onChange({ ...topic, strongman })}
            />

            <Popover open={takeOpen} onOpenChange={setTakeOpen}>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "h-6 px-1.5",
                    hasTake 
                      ? "text-orange-500 hover:text-orange-600" 
                      : "text-muted-foreground hover:text-orange-500"
                  )}
                  title={hasTake ? "Edit take" : "Add take"}
                >
                  <Flame className={cn("h-3.5 w-3.5", hasTake && "fill-current")} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Hot Take
                  </div>
                  <Textarea
                    value={topic.take || ""}
                    onChange={(e) => handleTakeChange(e.target.value)}
                    placeholder="What's your unique angle on this topic?"
                    className="min-h-[80px] text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your perspective that makes this topic interesting
                  </p>
                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      onClick={() => setTakeOpen(false)}
                      className="gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Save
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="p-0">
                  <div className="w-full" onClick={(e) => e.stopPropagation()}>
                    <TagButton
                      tags={topic.tags || []}
                      onChange={handleTagsChange}
                      allTags={allTags}
                      minimal
                    />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

        {/* Display take when not editing */}
        {!isEditing && hasTake && (
          <div className="flex items-start gap-1.5 ml-5 pl-2 border-l-2 border-orange-300">
            <Flame className="h-3 w-3 text-orange-500 shrink-0 mt-0.5" />
            <span className="text-xs text-muted-foreground italic">
              {topic.take}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicCard;
