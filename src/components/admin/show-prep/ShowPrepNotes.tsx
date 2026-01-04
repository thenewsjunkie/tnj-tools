import { useState, useEffect, useCallback, useRef } from "react";
import { format, isToday } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DndContext, closestCenter, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import DateSelector from "./DateSelector";
import HourCard from "./HourCard";
import DroppableHour from "./DroppableHour";
import { HourBlock, Topic, DEFAULT_SHOW_HOURS } from "./types";
import { isWeekend, getScheduledSegments, ScheduledSegment } from "./scheduledSegments";
import ScheduledSegmentsManager from "./ScheduledSegmentsManager";

const createEmptyHours = (): HourBlock[] => {
  return DEFAULT_SHOW_HOURS.map((hour) => ({
    ...hour,
    topics: [],
  }));
};

interface ShowPrepNotesProps {
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
}

const ShowPrepNotes = ({ selectedDate, onSelectedDateChange }: ShowPrepNotesProps) => {
  const [localHours, setLocalHours] = useState<HourBlock[]>(createEmptyHours());
  const [isSaving, setIsSaving] = useState(false);
  const isDraggingRef = useRef(false);
  const queryClient = useQueryClient();

  const dateKey = format(selectedDate, "yyyy-MM-dd");

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

  // Sync query data to local state for editing
  useEffect(() => {
    if (noteData) {
      const rawData = noteData.topics as unknown;
      if (rawData && typeof rawData === "object" && Array.isArray((rawData as { hours?: unknown }).hours)) {
        setLocalHours((rawData as { hours: HourBlock[] }).hours);
      } else if (Array.isArray(rawData)) {
        const migratedHours = createEmptyHours();
        migratedHours[0].topics = rawData as HourBlock["topics"];
        setLocalHours(migratedHours);
      } else {
        setLocalHours(createEmptyHours());
      }
    } else if (noteData === null) {
      setLocalHours(createEmptyHours());
    }
  }, [noteData]);

  const noteId = noteData?.id ?? null;
  const hours = localHours;

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
  const saveNotes = useCallback(async (hoursToSave: HourBlock[]) => {
    setIsSaving(true);
    try {
      const hoursJson = JSON.parse(JSON.stringify({ hours: hoursToSave }));
      
      if (noteId) {
        // Update existing
        const { error } = await supabase
          .from("show_prep_notes")
          .update({ topics: hoursJson })
          .eq("id", noteId);
        if (error) throw error;
      } else {
        // Check if there's any content to save
        const hasContent = hoursToSave.some((h) => h.topics.length > 0);
        if (hasContent) {
          // Create new
          const { error } = await supabase
            .from("show_prep_notes")
            .insert([{ date: dateKey, topics: hoursJson }]);
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
  }, [noteId, dateKey]);

  // Debounced save
  useEffect(() => {
    if (isLoading || isDraggingRef.current) return;
    
    const timeoutId = setTimeout(() => {
      saveNotes(hours);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [hours, isLoading, saveNotes]);

  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  const handleHourChange = (index: number, updatedHour: HourBlock) => {
    const newHours = [...hours];
    newHours[index] = updatedHour;
    setLocalHours(newHours);
  };

  const handleDragStart = (event: DragStartEvent) => {
    isDraggingRef.current = true;
    setActiveTopicId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTopicId(null);
    isDraggingRef.current = false;
    
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which hour contains the dragged topic
    const sourceHourIndex = hours.findIndex(h => 
      h.topics.some(t => t.id === activeId)
    );
    if (sourceHourIndex === -1) return;

    const sourceHour = hours[sourceHourIndex];
    const draggedTopic = sourceHour.topics.find(t => t.id === activeId);
    if (!draggedTopic) return;

    // Check if dropped on an hour (droppable zone) or on another topic
    let targetHourIndex: number;
    let targetTopicIndex: number | null = null;

    // First check if over is a topic ID
    const overTopicHourIndex = hours.findIndex(h => 
      h.topics.some(t => t.id === overId)
    );

    if (overTopicHourIndex !== -1) {
      // Dropped on a topic
      targetHourIndex = overTopicHourIndex;
      targetTopicIndex = hours[targetHourIndex].topics.findIndex(t => t.id === overId);
    } else {
      // Dropped on a droppable hour zone
      targetHourIndex = hours.findIndex(h => h.id === overId);
      if (targetHourIndex === -1) return;
    }

    // Deep clone to prevent reference sharing issues
    const newHours: HourBlock[] = JSON.parse(JSON.stringify(hours));

    if (sourceHourIndex === targetHourIndex) {
      // Same hour - reorder within the hour
      const topics = newHours[sourceHourIndex].topics;
      const oldIndex = topics.findIndex(t => t.id === activeId);
      const newIndex = targetTopicIndex ?? topics.length - 1;
      
      if (oldIndex !== newIndex) {
        const [removed] = topics.splice(oldIndex, 1);
        topics.splice(newIndex, 0, removed);
        // Update display orders
        topics.forEach((t, i) => t.display_order = i);
        newHours[sourceHourIndex] = { ...newHours[sourceHourIndex], topics };
      }
    } else {
      // Different hour - move topic (topic is already deep cloned)
      // Remove from source
      const sourceTopics = newHours[sourceHourIndex].topics.filter(t => t.id !== activeId);
      sourceTopics.forEach((t, i) => t.display_order = i);
      newHours[sourceHourIndex] = { ...newHours[sourceHourIndex], topics: sourceTopics };

      // Add to target - get the deep cloned version
      const targetTopics = newHours[targetHourIndex].topics;
      const insertIndex = targetTopicIndex ?? targetTopics.length;
      const movedTopic = JSON.parse(JSON.stringify(draggedTopic));
      movedTopic.display_order = insertIndex;
      targetTopics.splice(insertIndex, 0, movedTopic);
      targetTopics.forEach((t, i) => t.display_order = i);
      newHours[targetHourIndex] = { ...newHours[targetHourIndex], topics: targetTopics };
    }

    setLocalHours(newHours);
  };

  // Find the currently dragged topic for overlay
  const activeTopic = activeTopicId 
    ? hours.flatMap(h => h.topics).find(t => t.id === activeTopicId)
    : null;

  // Extract all unique tags from all topics for autocomplete
  const allTags = Array.from(
    new Set(hours.flatMap(h => h.topics.flatMap(t => t.tags || [])))
  ).sort();

  // Check if current time is within an hour block (with 5-minute early start)
  const isCurrentHour = (hour: HourBlock): boolean => {
    if (!isToday(selectedDate)) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Parse "11:00 AM" format to minutes since midnight
    const parseTimeToMinutes = (timeStr: string) => {
      const [time, period] = timeStr.split(" ");
      let [hours, mins] = time.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + mins;
    };

    const startMinutes = parseTimeToMinutes(hour.startTime);
    const endMinutes = parseTimeToMinutes(hour.endTime);

    // Expand if within 5 minutes before start OR during the hour
    return currentMinutes >= startMinutes - 5 && currentMinutes < endMinutes;
  };

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
          <div className="space-y-2">
            {hours.map((hour, index) => (
              <DroppableHour key={hour.id} id={hour.id}>
                <HourCard
                  hour={hour}
                  date={dateKey}
                  onChange={(updated) => handleHourChange(index, updated)}
                  defaultOpen={isCurrentHour(hour)}
                  scheduledSegments={getScheduledSegments(selectedDate, hour.id, scheduledSegments)}
                  allTags={allTags}
                />
              </DroppableHour>
            ))}
          </div>
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
