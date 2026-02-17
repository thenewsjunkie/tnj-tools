import { useState, useEffect, useCallback, useRef } from "react";
import { format, addDays } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DndContext, closestCenter, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import DateSelector from "./DateSelector";
import TopicList from "./TopicList";
import { HourBlock, Topic } from "./types";
import { isWeekend, getAllScheduledSegments, ScheduledSegment } from "./scheduledSegments";
import ScheduledSegmentsManager from "./ScheduledSegmentsManager";

interface ShowPrepNotesProps {
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
}

const ShowPrepNotes = ({ selectedDate, onSelectedDateChange }: ShowPrepNotesProps) => {
  const [localTopics, setLocalTopics] = useState<Topic[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const isDraggingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const hasUserEditedRef = useRef(false);
  const queryClient = useQueryClient();

  const dateKey = format(selectedDate, "yyyy-MM-dd");

  // Reset load tracking on date change
  useEffect(() => {
    hasLoadedRef.current = false;
    hasUserEditedRef.current = false;
  }, [dateKey]);

  // Fetch show prep notes using React Query
  const { data: noteData, isLoading } = useQuery({
    queryKey: ["show-prep-notes", dateKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("show_prep_notes")
        .select("*")
        .eq("date", dateKey)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Sync query data to local state only on initial load (not on background refetches)
  useEffect(() => {
    if (hasLoadedRef.current) return;
    if (noteData) {
      const rawData = noteData.topics as unknown;
      
      if (rawData && typeof rawData === "object") {
        if (Array.isArray((rawData as { topics?: unknown }).topics)) {
          setLocalTopics((rawData as { topics: Topic[] }).topics);
        } else if (Array.isArray((rawData as { hours?: unknown }).hours)) {
          const hours = (rawData as { hours: HourBlock[] }).hours;
          const flattenedTopics = hours.flatMap(h => h.topics);
          flattenedTopics.forEach((t, i) => t.display_order = i);
          setLocalTopics(flattenedTopics);
        } else if (Array.isArray(rawData)) {
          setLocalTopics(rawData as Topic[]);
        } else {
          setLocalTopics([]);
        }
      } else {
        setLocalTopics([]);
      }
      hasLoadedRef.current = true;
    } else if (noteData === null && !isLoading) {
      setLocalTopics([]);
      hasLoadedRef.current = true;
    }
  }, [noteData, isLoading]);

  const noteId = noteData?.id ?? null;

  // Fetch scheduled segments from database
  const { data: scheduledSegments = [] } = useQuery({
    queryKey: ["scheduled-segments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_segments")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data as ScheduledSegment[];
    },
  });

  // Auto-save with debounce
  const saveNotes = useCallback(async (topicsToSave: Topic[]) => {
    setIsSaving(true);
    try {
      const topicsJson = JSON.parse(JSON.stringify({ topics: topicsToSave }));
      
      if (noteId) {
        // Update existing
        const { error } = await supabase
          .from("show_prep_notes")
          .update({ topics: topicsJson })
          .eq("id", noteId);
        if (error) throw error;
      } else {
        // Check if there's any content to save
        const hasContent = topicsToSave.length > 0;
        if (hasContent) {
          // Create new
          const { error } = await supabase
            .from("show_prep_notes")
            .insert([{ date: dateKey, topics: topicsJson }]);
          if (error) throw error;
          // Invalidate to refetch with new ID
          queryClient.invalidateQueries({ queryKey: ["show-prep-notes", dateKey] });
        }
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  }, [noteId, dateKey, queryClient]);

  // Keep a ref to localTopics so saveImmediately can access latest
  const localTopicsRef = useRef(localTopics);
  localTopicsRef.current = localTopics;

  // Debounced save - only when user has explicitly edited
  useEffect(() => {
    if (isLoading || isDraggingRef.current || !hasUserEditedRef.current) return;
    
    const timeoutId = setTimeout(() => {
      saveNotes(localTopics);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [localTopics, isLoading, saveNotes]);

  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  const handleTopicsChange = (newTopics: Topic[]) => {
    hasUserEditedRef.current = true;
    setLocalTopics(newTopics);
  };

  // Immediate save callback for critical updates (e.g. rundown generation)
  const handleSaveImmediately = useCallback((updatedTopics?: Topic[]) => {
    const topicsToSave = updatedTopics || localTopicsRef.current;
    hasUserEditedRef.current = true;
    saveNotes(topicsToSave).then(() => {
      // Update React Query cache so future reads have correct data
      queryClient.setQueryData(["show-prep-notes", dateKey], (old: any) => {
        if (!old) return old;
        return { ...old, topics: JSON.parse(JSON.stringify({ topics: topicsToSave })) };
      });
    });
  }, [saveNotes, queryClient, dateKey]);

  const handleMoveTopicToNextDay = async (topicToMove: Topic) => {
    try {
      // 1. Calculate next day's date
      const nextDate = format(addDays(selectedDate, 1), "yyyy-MM-dd");
      
      // 2. Remove from current day's topics
      const updatedLocalTopics = localTopics.filter(t => t.id !== topicToMove.id);
      setLocalTopics(updatedLocalTopics);
      
      // 3. Fetch next day's data
      const { data: nextDayData } = await supabase
        .from("show_prep_notes")
        .select("*")
        .eq("date", nextDate)
        .maybeSingle();
      
      // 4. Parse existing topics for next day
      let nextDayTopics: Topic[] = [];
      if (nextDayData?.topics) {
        const rawData = nextDayData.topics as unknown;
        if (rawData && typeof rawData === "object") {
          if (Array.isArray((rawData as { topics?: unknown }).topics)) {
            nextDayTopics = (rawData as { topics: Topic[] }).topics;
          } else if (Array.isArray(rawData)) {
            nextDayTopics = rawData as Topic[];
          }
        }
      }
      
      // 5. Add topic to next day (at end, with new display_order)
      const movedTopic = {
        ...topicToMove,
        display_order: nextDayTopics.length,
      };
      nextDayTopics.push(movedTopic);
      
      // 6. Save to next day
      const { error } = await supabase
        .from("show_prep_notes")
        .upsert({
          date: nextDate,
          topics: JSON.parse(JSON.stringify({ topics: nextDayTopics }))
        }, { onConflict: "date" });
      
      if (error) throw error;
      
      // 7. Invalidate query cache for next day
      queryClient.invalidateQueries({ 
        queryKey: ["show-prep-notes", nextDate] 
      });
      
      // 8. Show success toast
      toast.success("Moved to " + format(addDays(selectedDate, 1), "MMM d"));
    } catch (error) {
      console.error("Error moving topic:", error);
      toast.error("Failed to move topic");
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    isDraggingRef.current = true;
    setActiveTopicId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTopicId(null);
    isDraggingRef.current = false;
    
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const oldIndex = localTopics.findIndex(t => t.id === activeId);
    const newIndex = localTopics.findIndex(t => t.id === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(localTopics, oldIndex, newIndex);
      // Update display orders
      reordered.forEach((t, i) => t.display_order = i);
      setLocalTopics(reordered);
    }
  };

  // Find the currently dragged topic for overlay
  const activeTopic = activeTopicId 
    ? localTopics.find(t => t.id === activeTopicId)
    : null;

  // Get all scheduled segments for today (not filtered by hour)
  const daySegments = getAllScheduledSegments(selectedDate, scheduledSegments);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DateSelector date={selectedDate} onChange={onSelectedDateChange} />
          {isWeekend(selectedDate) && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Weekend
            </span>
          )}
          <ScheduledSegmentsManager />
        </div>
        {isSaving && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving...
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <TopicList
            topics={localTopics}
            date={dateKey}
            onChange={handleTopicsChange}
            onMoveTopicToNextDay={handleMoveTopicToNextDay}
            onSaveImmediately={handleSaveImmediately}
          />
          <DragOverlay>
            {activeTopic ? (
              <div className="bg-card border rounded-lg p-3 shadow-lg opacity-90">
                <span className="font-medium text-sm">{activeTopic.title || "Untitled Topic"}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};

export default ShowPrepNotes;
