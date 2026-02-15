import { useState, useEffect, useRef, useCallback } from "react";
import { format, addDays, isToday } from "date-fns";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Notepad from "@/components/admin/show-prep/Notepad";
import DateSelector from "@/components/admin/show-prep/DateSelector";

const NotepadPage = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const saved = localStorage.getItem('show-prep-selected-date');
    if (saved) {
      const parsed = new Date(saved);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });
  const [notepad, setNotepad] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const hasLoadedRef = useRef(false);
  const { toast } = useToast();

  const dateKey = format(selectedDate, "yyyy-MM-dd");

  const loadData = useCallback(async () => {
    hasLoadedRef.current = false;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("show_prep_notes")
        .select("notepad")
        .eq("date", dateKey)
        .maybeSingle();

      if (error) throw error;
      setNotepad(data?.notepad || "");
    } catch (error) {
      console.error("Error loading notepad:", error);
      toast({ title: "Error", description: "Could not load notepad", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setTimeout(() => { hasLoadedRef.current = true; }, 100);
    }
  }, [dateKey, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    localStorage.setItem('show-prep-selected-date', selectedDate.toISOString());
  }, [selectedDate]);

  // Debounced save
  useEffect(() => {
    if (isLoading || !hasLoadedRef.current) return;
    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await supabase.from("show_prep_notes").upsert({
          date: dateKey,
          notepad: notepad || null,
        }, { onConflict: "date" });
      } catch (error) {
        console.error("Error saving notepad:", error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [notepad, dateKey, isLoading]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Link
          to="/admin"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Admin</span>
        </Link>

        <div className="flex items-center gap-2">
          {isSaving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
          <DateSelector date={selectedDate} onChange={setSelectedDate} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Notepad
          value={notepad}
          onChange={setNotepad}
          isOpen={true}
          onToggle={() => {}}
        />
      )}
    </div>
  );
};

export default NotepadPage;
