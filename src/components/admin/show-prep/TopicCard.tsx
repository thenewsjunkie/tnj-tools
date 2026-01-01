import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, GripVertical, Trash2, Pencil, Check, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import BulletEditor from "./BulletEditor";
import LinksList from "./LinksList";
import ImageGallery from "./ImageGallery";
import { Topic, Bullet } from "./types";
import { v4 as uuidv4 } from "uuid";

interface TopicCardProps {
  topic: Topic;
  onChange: (topic: Topic) => void;
  onDelete: () => void;
}

const TopicCard = ({ topic, onChange, onDelete }: TopicCardProps) => {
  const hasContent = topic.title.trim() || topic.bullets.some(b => b.text.trim()) || topic.links.length > 0 || topic.images.length > 0;
  const [isEditing, setIsEditing] = useState(!hasContent);
  const [isOpen, setIsOpen] = useState(!topic.completed);

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

  const completedBullets = topic.bullets.filter((b) => b.checked).length;
  const totalBullets = topic.bullets.filter((b) => b.text.trim()).length;
  const progress = totalBullets > 0 ? (completedBullets / totalBullets) * 100 : 0;

  useEffect(() => {
    if (topic.bullets.length === 0) {
      onChange({
        ...topic,
        bullets: [{ id: uuidv4(), text: "", checked: false, indent: 0 }],
      });
    }
  }, []);

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleToggleComplete = () => {
    const newCompleted = !topic.completed;
    onChange({ ...topic, completed: newCompleted });
    if (newCompleted) {
      setIsOpen(false);
    }
  };

  const displayBullets = topic.bullets.filter(b => b.text.trim());

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-50")}
    >
      <Card className={cn("border-border/50", topic.completed && "bg-muted/30 opacity-70")}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="py-2 px-3">
            <div className="flex items-center gap-2">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing touch-none"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>

              <CollapsibleTrigger className="flex-shrink-0">
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </CollapsibleTrigger>

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

              {totalBullets > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span>{completedBullets}/{totalBullets}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
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

          <CollapsibleContent>
            <CardContent className="pt-0 pb-3 px-3 space-y-3">
              {isEditing ? (
                <>
                  <BulletEditor
                    bullets={topic.bullets}
                    onChange={(bullets) => onChange({ ...topic, bullets })}
                  />
                  <LinksList
                    links={topic.links}
                    onChange={(links) => onChange({ ...topic, links })}
                    isEditing={true}
                  />
                  <ImageGallery
                    images={topic.images}
                    onChange={(images) => onChange({ ...topic, images })}
                    isEditing={true}
                  />
                </>
              ) : (
                <>
                  {/* View mode: Display bullets as formatted list */}
                  {displayBullets.length > 0 && (
                    <div className="space-y-1">
                      {displayBullets.map((bullet) => (
                        <div
                          key={bullet.id}
                          className="flex items-start gap-2"
                          style={{ paddingLeft: `${bullet.indent * 16}px` }}
                        >
                          {bullet.checked ? (
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          ) : (
                            <span className="text-muted-foreground mt-0.5">•</span>
                          )}
                          <span
                            className={cn(
                              "text-sm",
                              bullet.checked && "line-through text-muted-foreground"
                            )}
                          >
                            {bullet.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* View mode: Display links (read-only) */}
                  <LinksList
                    links={topic.links}
                    onChange={(links) => onChange({ ...topic, links })}
                    isEditing={false}
                  />
                  
                  {/* View mode: Display images (read-only) */}
                  <ImageGallery
                    images={topic.images}
                    onChange={(images) => onChange({ ...topic, images })}
                    isEditing={false}
                  />
                </>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};

export default TopicCard;
