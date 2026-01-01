import { useState, useEffect, useCallback } from "react";
import { format, isToday } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CalendarOff } from "lucide-react";
import { toast } from "sonner";
import DateSelector from "./DateSelector";
import HourCard from "./HourCard";
import { HourBlock, DEFAULT_SHOW_HOURS } from "./types";
import { isWeekend, getScheduledSegments } from "./scheduledSegments";

const createEmptyHours = (): HourBlock[] => {
  return DEFAULT_SHOW_HOURS.map((hour) => ({
    ...hour,
    topics: [],
  }));
};

const ShowPrepNotes = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hours, setHours] = useState<HourBlock[]>(createEmptyHours());
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
          // Handle both new hours format and legacy topics format
          const rawData = data.topics as unknown;
          if (rawData && typeof rawData === "object" && Array.isArray((rawData as { hours?: unknown }).hours)) {
            // New format with hours
            setHours((rawData as { hours: HourBlock[] }).hours);
          } else if (Array.isArray(rawData)) {
            // Legacy format - migrate topics to first hour
            const migratedHours = createEmptyHours();
            migratedHours[0].topics = rawData as HourBlock["topics"];
            setHours(migratedHours);
          } else {
            setHours(createEmptyHours());
          }
        } else {
          setNoteId(null);
          setHours(createEmptyHours());
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
          const { data, error } = await supabase
            .from("show_prep_notes")
            .insert([{ date: dateKey, topics: hoursJson }])
            .select("id")
            .single();
          if (error) throw error;
          setNoteId(data.id);
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
    if (isLoading) return;
    
    const timeoutId = setTimeout(() => {
      saveNotes(hours);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [hours, isLoading, saveNotes]);

  const handleHourChange = (index: number, updatedHour: HourBlock) => {
    const newHours = [...hours];
    newHours[index] = updatedHour;
    setHours(newHours);
  };

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
        <DateSelector date={selectedDate} onChange={setSelectedDate} />
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
      ) : isWeekend(selectedDate) ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <CalendarOff className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-lg font-medium">Show is OFF</p>
          <p className="text-sm">No show on weekends</p>
        </div>
      ) : (
        <div className="space-y-2">
          {hours.map((hour, index) => (
            <HourCard
              key={hour.id}
              hour={hour}
              onChange={(updated) => handleHourChange(index, updated)}
              defaultOpen={isCurrentHour(hour)}
              scheduledSegments={getScheduledSegments(selectedDate, hour.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowPrepNotes;
