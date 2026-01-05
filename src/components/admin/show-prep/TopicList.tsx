import { useState } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarClock, Plus } from "lucide-react";
import TopicCard from "./TopicCard";
import AddTopicDialog from "./AddTopicDialog";
import { Topic } from "./types";
import { ScheduledSegment } from "./scheduledSegments";

interface TopicListProps {
  topics: Topic[];
  date: string;
  onChange: (topics: Topic[]) => void;
  scheduledSegments: ScheduledSegment[];
  allTags: string[];
}

const TopicList = ({ topics, date, onChange, scheduledSegments, allTags }: TopicListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddTopic = (newTopic: Topic) => {
    const topicWithOrder = {
      ...newTopic,
      display_order: topics.length,
    };
    onChange([...topics, topicWithOrder]);
  };

  const handleTopicChange = (index: number, updatedTopic: Topic) => {
    const newTopics = [...topics];
    newTopics[index] = updatedTopic;
    onChange(newTopics);
  };

  const handleTopicDelete = (index: number) => {
    onChange(topics.filter((_, i) => i !== index));
  };

  // Sort scheduled segments by time
  const sortedSegments = [...scheduledSegments].sort((a, b) => {
    const parseTime = (t: string) => {
      const [time, period] = t.split(" ");
      let [hours, mins] = time.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + mins;
    };
    return parseTime(a.time) - parseTime(b.time);
  });

  return (
    <>
      <Card className="bg-muted/30">
        <CardHeader className="p-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">
              Topics ({topics.length})
            </span>
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

        <CardContent className="p-2 pt-0 space-y-2">
          {sortedSegments.length > 0 && (
            <div className="space-y-0.5 pb-1.5 border-b border-border/50">
              {sortedSegments.map((segment, idx) => (
                <div
                  key={segment.id || idx}
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

          {topics.length === 0 && sortedSegments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              No topics scheduled. Click "Add Topic" to add content.
            </p>
          ) : (
            <SortableContext items={topics.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {topics.map((topic, index) => (
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
      </Card>

      <AddTopicDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddTopic}
      />
    </>
  );
};

export default TopicList;
