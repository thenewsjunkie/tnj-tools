import { useState } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import TopicCard from "./TopicCard";
import AddTopicDialog from "./AddTopicDialog";
import { Topic } from "./types";

interface TopicListProps {
  topics: Topic[];
  date: string;
  onChange: (topics: Topic[]) => void;
  onMoveTopicToNextDay: (topic: Topic) => void;
}

const TopicList = ({ topics, date, onChange, onMoveTopicToNextDay }: TopicListProps) => {
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
          {topics.length === 0 ? (
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
                    onMoveToNextDay={() => onMoveTopicToNextDay(topic)}
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
