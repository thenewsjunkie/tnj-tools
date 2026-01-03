import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2, Pencil, Check, CheckCircle2, Circle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Topic } from "./types";

interface TopicCardProps {
  topic: Topic;
  date: string;
  onChange: (topic: Topic) => void;
  onDelete: () => void;
}

const TopicCard = ({ topic, date, onChange, onDelete }: TopicCardProps) => {
  const navigate = useNavigate();
  const hasContent = topic.title.trim() || topic.links.length > 0 || topic.images.length > 0;
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

  const handleToggleComplete = () => {
    onChange({ ...topic, completed: !topic.completed });
  };

  const handleOpenResources = () => {
    navigate(`/admin/topic-resources/${date}/${topic.id}`);
  };

  const resourceCount = topic.links.length + topic.images.length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-50")}
    >
      <Card className={cn("border-border/50", topic.completed && "bg-muted/30 opacity-70")}>
        <CardHeader className="py-2 px-3">
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex-1 min-w-0">
              {isEditing ? (
                <Input
                  value={topic.title}
                  onChange={(e) => onChange({ ...topic, title: e.target.value })}
                  placeholder="Topic title..."
                  className="h-7 text-sm font-medium border-0 bg-transparent px-0 focus-visible:ring-0"
                />
              ) : (
                <span className={cn(
                  "text-sm font-medium truncate block",
                  topic.completed && "line-through text-muted-foreground"
                )}>
                  {topic.title || "Untitled Topic"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
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
              <Button
                size="sm"
                variant="ghost"
                className={cn(
                  "h-7 w-7 p-0",
                  topic.completed ? "text-green-500 hover:text-green-600" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={handleToggleComplete}
                title={topic.completed ? "Mark as incomplete" : "Mark as complete"}
              >
                {topic.completed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </Button>
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
