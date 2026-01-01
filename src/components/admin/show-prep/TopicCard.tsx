import { useState } from "react";
import { Topic } from "./types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, GripVertical, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import BulletEditor from "./BulletEditor";
import LinksList from "./LinksList";
import ImageGallery from "./ImageGallery";
import { v4 as uuidv4 } from "uuid";

interface TopicCardProps {
  topic: Topic;
  onChange: (topic: Topic) => void;
  onDelete: () => void;
}

const TopicCard = ({ topic, onChange, onDelete }: TopicCardProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
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
    : [{ id: uuidv4(), text: "", indent: 0 }];

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className="bg-card/50"
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
            
            <Input
              value={topic.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Topic title..."
              className="h-7 flex-1 border-0 bg-transparent font-medium focus-visible:ring-0 px-1"
            />
            
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
        <CardContent className="p-3 pt-2 space-y-3">
            <BulletEditor bullets={bullets} onChange={handleBulletsChange} />
            <LinksList links={topic.links} onChange={handleLinksChange} isEditing={isHovered} />
            <ImageGallery images={topic.images} onChange={handleImagesChange} isEditing={isHovered} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default TopicCard;
