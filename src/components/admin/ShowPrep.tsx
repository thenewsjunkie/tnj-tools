import { useState, useEffect, useRef, useCallback } from "react";
import { format, isFriday as checkIsFriday, addDays, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronLeft, ChevronRight, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import Hopper from "./show-prep/Hopper";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ShowPrepNotes from "./show-prep/ShowPrepNotes";

interface ShowPrepTopics {
  fromTopic: string;
  toTopic: string;
  andTopic: string;
}

interface AutoSizeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const AutoSizeInput = ({ value, onChange, placeholder, disabled }: AutoSizeInputProps) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(80);

  useEffect(() => {
    if (spanRef.current) {
      const newWidth = Math.max(80, spanRef.current.offsetWidth + 4);
      setWidth(newWidth);
    }
  }, [value]);

  return (
    <span className="relative inline-block">
      <span
        ref={spanRef}
        className="invisible absolute whitespace-pre font-medium text-base px-1"
        aria-hidden="true"
      >
        {value || placeholder}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{ width: `${width}px` }}
        className="h-8 border-0 border-b-2 border-muted-foreground rounded-none bg-transparent px-1 font-medium text-base focus:outline-none focus:border-primary placeholder:text-muted-foreground/50 disabled:opacity-50"
      />
    </span>
  );
};

const ShowPrep = () => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const saved = localStorage.getItem('show-prep-selected-date');
    if (saved) {
      const parsed = new Date(saved);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return new Date();
  });
  const [topics, setTopics] = useState<ShowPrepTopics>({ fromTopic: "", toTopic: "", andTopic: "" });
  const [lastMinuteFrom, setLastMinuteFrom] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isHopperOpen, setIsHopperOpen] = useState(false);
  const hasLoadedRef = useRef(false);
  const { toast } = useToast();

  const selectedDateFormatted = format(selectedDate, "EEEE, MMMM do yyyy");
  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const isFriday = checkIsFriday(selectedDate);
  const isSelectedToday = isToday(selectedDate);

  // Load data from Supabase
  const loadData = useCallback(async () => {
    hasLoadedRef.current = false;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("show_prep_notes")
        .select("from_topic, to_topic, and_topic, last_minute_from")
        .eq("date", dateKey)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTopics({
          fromTopic: data.from_topic || "",
          toTopic: data.to_topic || "",
          andTopic: data.and_topic || "",
        });
        setLastMinuteFrom(data.last_minute_from || "");
      } else {
        // Check localStorage for migration
        const localTopicsKey = `show-prep-topics-${dateKey}`;
        const localLastMinuteKey = `show-prep-last-minute-${dateKey}`;
        const localTopics = localStorage.getItem(localTopicsKey);
        const localLastMinute = localStorage.getItem(localLastMinuteKey);

        if (localTopics || localLastMinute) {
          const parsedTopics = localTopics ? JSON.parse(localTopics) : { fromTopic: "", toTopic: "", andTopic: "" };
          const parsedLastMinute = localLastMinute || "";

          setTopics(parsedTopics);
          setLastMinuteFrom(parsedLastMinute);

          // Migrate to Supabase
          await supabase.from("show_prep_notes").upsert({
            date: dateKey,
            from_topic: parsedTopics.fromTopic || null,
            to_topic: parsedTopics.toTopic || null,
            and_topic: parsedTopics.andTopic || null,
            last_minute_from: parsedLastMinute || null,
            topics: [],
          });

          // Clear localStorage after migration
          localStorage.removeItem(localTopicsKey);
          localStorage.removeItem(localLastMinuteKey);
        } else {
          setTopics({ fromTopic: "", toTopic: "", andTopic: "" });
          setLastMinuteFrom("");
        }
      }
    } catch (error) {
      console.error("Error loading show prep topics:", error);
      toast({
        title: "Error loading topics",
        description: "Could not load show prep topics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Mark as loaded after state has settled
      setTimeout(() => {
        hasLoadedRef.current = true;
      }, 100);
    }
  }, [dateKey, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Persist selected date to localStorage
  useEffect(() => {
    localStorage.setItem('show-prep-selected-date', selectedDate.toISOString());
  }, [selectedDate]);

  // Debounced save to Supabase - only after initial load is complete
  useEffect(() => {
    if (isLoading || !hasLoadedRef.current) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await supabase.from("show_prep_notes").upsert({
          date: dateKey,
          from_topic: topics.fromTopic || null,
          to_topic: topics.toTopic || null,
          and_topic: topics.andTopic || null,
          last_minute_from: lastMinuteFrom || null,
        }, { onConflict: "date" });
      } catch (error) {
        console.error("Error saving topics:", error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [topics, lastMinuteFrom, dateKey, isLoading]);

  const navigateDay = (offset: number) => {
    setSelectedDate(prev => addDays(prev, offset));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handleChange = (field: keyof ShowPrepTopics, value: string) => {
    setTopics(prev => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    setTopics({ fromTopic: "", toTopic: "", andTopic: "" });
  };

  const handleClearLastMinute = () => {
    setLastMinuteFrom("");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3 text-base leading-loose">
          {/* Date Navigation Header */}
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigateDay(-1)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <p className="text-foreground flex items-center justify-center gap-2">
                It is <span className="font-semibold">{selectedDateFormatted}</span>
                {isSaving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </p>
              <div className="flex items-center justify-center gap-2">
                {!isSelectedToday && (
                  <Button variant="link" size="sm" onClick={goToToday} className="text-xs p-0 h-auto">
                    Go to Today
                  </Button>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigateDay(1)}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Line 2: From topic */}
              <p className="text-foreground">
                Lots to get to today from{" "}
                <AutoSizeInput
                  value={topics.fromTopic}
                  onChange={(value) => handleChange("fromTopic", value)}
                  placeholder="topic..."
                />
              </p>
              
              {/* Line 3: To topic */}
              <p className="text-foreground">
                to{" "}
                <AutoSizeInput
                  value={topics.toTopic}
                  onChange={(value) => handleChange("toTopic", value)}
                  placeholder="topic..."
                />
              </p>
              
              {/* Line 4: And topic */}
              <p className="text-foreground">
                and{" "}
                <AutoSizeInput
                  value={topics.andTopic}
                  onChange={(value) => handleChange("andTopic", value)}
                  placeholder="topic..."
                />
              </p>
              
              {/* Static closing line */}
              <p className="text-foreground">
                plus your calls, Dispatches, emails, texts & more.
              </p>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear All
              </Button>

              {/* Friday: Last Minute Message */}
              {isFriday && (
                <div className="mt-4 space-y-2">
                  <p className="text-foreground">
                    Last Minute Message From:{" "}
                    <AutoSizeInput
                      value={lastMinuteFrom}
                      onChange={setLastMinuteFrom}
                      placeholder="name..."
                    />
                  </p>
                  {lastMinuteFrom && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearLastMinute}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="md:pl-6 md:border-l border-border">
          <ShowPrepNotes selectedDate={selectedDate} onSelectedDateChange={setSelectedDate} />
        </div>
      </div>

      {/* The Hopper Section */}
      <div className="w-full border-t border-border pt-4">
        <Button
          variant="outline"
          onClick={() => setIsHopperOpen(!isHopperOpen)}
          className="w-full justify-between"
        >
          <span>{isHopperOpen ? "Close Hopper" : "Open Hopper"}</span>
          {isHopperOpen ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
        </Button>
        
        {isHopperOpen && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg min-h-[200px]">
            <Hopper selectedDate={selectedDate} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowPrep;
