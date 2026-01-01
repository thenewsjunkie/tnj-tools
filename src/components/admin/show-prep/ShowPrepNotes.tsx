import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import DateSelector from "./DateSelector";
import TopicCard from "./TopicCard";
import { Topic, ShowPrepNotesData } from "./types";

const ShowPrepNotes = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [noteId, setNoteId] = useState<string | null>(null);

  const dateKey = format(selectedDate, "yyyy-MM-dd");

  // Load notes for selected date
  useEffect(() => {
    const loadNotes = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("show_prep_notes")
          .select("*")
          .eq("date", dateKey)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setNoteId(data.id);
          const loadedTopics = Array.isArray(data.topics) ? data.topics as unknown as Topic[] : [];
          setTopics(loadedTopics);
        } else {
          setNoteId(null);
          setTopics([]);
        }
      } catch (error) {
        console.error("Error loading notes:", error);
        toast.error("Failed to load notes");
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [dateKey]);

  // Auto-save with debounce
  const saveNotes = useCallback(async (topicsToSave: Topic[]) => {
    setIsSaving(true);
    try {
      const topicsJson = JSON.parse(JSON.stringify(topicsToSave));
      
      if (noteId) {
        // Update existing
        const { error } = await supabase
          .from("show_prep_notes")
          .update({ topics: topicsJson })
          .eq("id", noteId);
        if (error) throw error;
      } else if (topicsToSave.length > 0) {
        // Create new
        const { data, error } = await supabase
          .from("show_prep_notes")
          .insert([{ date: dateKey, topics: topicsJson }])
          .select("id")
          .single();
        if (error) throw error;
        setNoteId(data.id);
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  }, [noteId, dateKey]);

  // Debounced save
  useEffect(() => {
    if (isLoading) return;
    
    const timeoutId = setTimeout(() => {
      saveNotes(topics);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [topics, isLoading, saveNotes]);

  const handleAddTopic = () => {
    const newTopic: Topic = {
      id: uuidv4(),
      title: "",
      display_order: topics.length,
      bullets: [{ id: uuidv4(), text: "", indent: 0 }],
      links: [],
      images: [],
    };
    setTopics([...topics, newTopic]);
  };

  const handleTopicChange = (index: number, updatedTopic: Topic) => {
    const newTopics = [...topics];
    newTopics[index] = updatedTopic;
    setTopics(newTopics);
  };

  const handleTopicDelete = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = topics.findIndex((t) => t.id === active.id);
    const newIndex = topics.findIndex((t) => t.id === over.id);
    
    const reordered = arrayMove(topics, oldIndex, newIndex).map((topic, i) => ({
      ...topic,
      display_order: i,
    }));
    
    setTopics(reordered);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <DateSelector date={selectedDate} onChange={setSelectedDate} />
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </span>
          )}
          <Button size="sm" onClick={handleAddTopic} className="h-8">
            <Plus className="h-4 w-4 mr-1" />
            Add Topic
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No topics yet. Click "Add Topic" to get started.
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={topics.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {topics.map((topic, index) => (
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
    </div>
  );
};

export default ShowPrepNotes;
