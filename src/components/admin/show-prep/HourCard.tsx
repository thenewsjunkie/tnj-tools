import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Clock, Plus } from "lucide-react";
import TopicCard from "./TopicCard";
import { HourBlock, Topic } from "./types";

interface HourCardProps {
  hour: HourBlock;
  onChange: (hour: HourBlock) => void;
  defaultOpen?: boolean;
}

const HourCard = ({ hour, onChange, defaultOpen = false }: HourCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleAddTopic = () => {
    const newTopic: Topic = {
      id: uuidv4(),
      title: "",
      display_order: hour.topics.length,
      bullets: [{ id: uuidv4(), text: "", indent: 0 }],
      links: [],
      images: [],
    };
    onChange({ ...hour, topics: [...hour.topics, newTopic] });
  };

  const handleTopicChange = (index: number, updatedTopic: Topic) => {
    const newTopics = [...hour.topics];
    newTopics[index] = updatedTopic;
    onChange({ ...hour, topics: newTopics });
  };

  const handleTopicDelete = (index: number) => {
    onChange({ ...hour, topics: hour.topics.filter((_, i) => i !== index) });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = hour.topics.findIndex((t) => t.id === active.id);
    const newIndex = hour.topics.findIndex((t) => t.id === over.id);

    const reordered = arrayMove(hour.topics, oldIndex, newIndex).map((topic, i) => ({
      ...topic,
      display_order: i,
    }));

    onChange({ ...hour, topics: reordered });
  };

  return (
    <Card className="bg-muted/30">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </CollapsibleTrigger>
              
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">
                {hour.startTime} - {hour.endTime}
              </span>
              <span className="text-xs text-muted-foreground">
                ({hour.topics.length} {hour.topics.length === 1 ? "topic" : "topics"})
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleAddTopic}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Topic
            </Button>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="p-3 pt-0">
            {hour.topics.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No topics scheduled. Click "Add Topic" to add content for this hour.
              </p>
            ) : (
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={hour.topics.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {hour.topics.map((topic, index) => (
                      <TopicCard
                        key={topic.id}
                        topic={topic}
                        onChange={(updated) => handleTopicChange(index, updated)}
                        onDelete={() => handleTopicDelete(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default HourCard;
