import { useState, useEffect } from "react";
import { Topic } from "./types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, GripVertical, Trash2, CheckCircle2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import BulletEditor from "./BulletEditor";
import LinksList from "./LinksList";
import ImageGallery from "./ImageGallery";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";

interface TopicCardProps {
  topic: Topic;
  onChange: (topic: Topic) => void;
  onDelete: () => void;
}

const TopicCard = ({ topic, onChange, onDelete }: TopicCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate completion
  const bulletsWithText = topic.bullets.filter(b => b.text.trim());
  const checkedCount = bulletsWithText.filter(b => b.checked).length;
  const totalCount = bulletsWithText.length;
  const isComplete = totalCount > 0 && checkedCount === totalCount;
  
  // Auto-collapse when complete
  const [isOpen, setIsOpen] = useState(!isComplete);
  
  useEffect(() => {
    if (isComplete) {
      setIsOpen(false);
    }
  }, [isComplete]);
  
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
    opacity: isDragging ? 0.5 : 1,
  };

  const handleTitleChange = (title: string) => {
    onChange({ ...topic, title });
  };

  const handleBulletsChange = (bullets: Topic["bullets"]) => {
    onChange({ ...topic, bullets });
  };

  const handleLinksChange = (links: Topic["links"]) => {
    onChange({ ...topic, links });
  };

  const handleImagesChange = (images: string[]) => {
    onChange({ ...topic, images });
  };

  // Initialize with one bullet if empty
  const bullets = topic.bullets.length > 0 
    ? topic.bullets 
    : [{ id: uuidv4(), text: "", indent: 0, checked: false }];

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "bg-card/50 border-l-2 transition-colors",
        isComplete ? "border-l-green-500/50 bg-green-500/5" : "border-l-primary/30"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="p-3 pb-0">
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            
            <CollapsibleTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </CollapsibleTrigger>
            
            {isComplete && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            
            <Input
              value={topic.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Topic title..."
              className={cn(
                "h-8 flex-1 border-0 bg-transparent text-base font-semibold focus-visible:ring-0 px-1",
                isComplete && "text-muted-foreground"
              )}
            />
            
            {/* Progress indicator */}
            {totalCount > 0 && (
              <span className={cn(
                "text-xs tabular-nums",
                isComplete ? "text-green-500" : "text-muted-foreground"
              )}>
                {checkedCount}/{totalCount}
              </span>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 w-7 p-0 text-muted-foreground hover:text-destructive transition-opacity",
                isHovered ? "opacity-100" : "opacity-0"
              )}
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="p-3 pt-2 space-y-4">
            <BulletEditor bullets={bullets} onChange={handleBulletsChange} />
            
            <div className="space-y-3 pt-2 border-t border-border/50">
              <LinksList links={topic.links} onChange={handleLinksChange} isEditing={isHovered} />
              <ImageGallery images={topic.images} onChange={handleImagesChange} isEditing={isHovered} />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default TopicCard;
