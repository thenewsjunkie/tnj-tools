import { useState } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Clock, Plus, CalendarClock } from "lucide-react";
import TopicCard from "./TopicCard";
import AddTopicDialog from "./AddTopicDialog";
import { HourBlock, Topic } from "./types";
import { ScheduledSegment } from "./scheduledSegments";

interface HourCardProps {
  hour: HourBlock;
  date: string;
  onChange: (hour: HourBlock) => void;
  defaultOpen?: boolean;
  scheduledSegments?: ScheduledSegment[];
  allTags?: string[];
}

const HourCard = ({ hour, date, onChange, defaultOpen = false, scheduledSegments = [], allTags = [] }: HourCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddTopic = (newTopic: Topic) => {
    const topicWithOrder = {
      ...newTopic,
      display_order: hour.topics.length,
    };
    onChange({ ...hour, topics: [...hour.topics, topicWithOrder] });
  };

  const handleTopicChange = (index: number, updatedTopic: Topic) => {
    const newTopics = [...hour.topics];
    newTopics[index] = updatedTopic;
    onChange({ ...hour, topics: newTopics });
  };

  const handleTopicDelete = (index: number) => {
    onChange({ ...hour, topics: hour.topics.filter((_, i) => i !== index) });
  };

  return (
    <>
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
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Topic
              </Button>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="p-3 pt-0 space-y-3">
              {scheduledSegments.length > 0 && (
                <div className="space-y-1 pb-2 border-b border-border/50">
                  {scheduledSegments.map((segment, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-muted-foreground italic"
                    >
                      <CalendarClock className="h-3 w-3 text-primary/60" />
                      <span className="font-medium">{segment.time}</span>
                      <span>—</span>
                      <span>{segment.name}</span>
                    </div>
                  ))}
                </div>
              )}
              {hour.topics.length === 0 && scheduledSegments.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No topics scheduled. Click "Add Topic" to add content for this hour.
                </p>
              ) : (
                <SortableContext items={hour.topics.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {hour.topics.map((topic, index) => (
                      <TopicCard
                        key={topic.id}
                        topic={topic}
                        date={date}
                        onChange={(updated) => handleTopicChange(index, updated)}
                        onDelete={() => handleTopicDelete(index)}
                        allTags={allTags}
                      />
                    ))}
                  </div>
                </SortableContext>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <AddTopicDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddTopic}
      />
    </>
  );
};

export default HourCard;
