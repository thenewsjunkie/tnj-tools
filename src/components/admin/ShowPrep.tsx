import { useState, useEffect, useRef, useCallback } from "react";
import { format, isFriday as checkIsFriday, addDays, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import ShowPrepNotes from "./show-prep/ShowPrepNotes";

const getStorageKey = (baseKey: string, date: Date) => {
  return `${baseKey}-${format(date, "yyyy-MM-dd")}`;
};

interface ShowPrepTopics {
  fromTopic: string;
  toTopic: string;
  andTopic: string;
}

interface AutoSizeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const AutoSizeInput = ({ value, onChange, placeholder }: AutoSizeInputProps) => {
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
        style={{ width: `${width}px` }}
        className="h-8 border-0 border-b-2 border-muted-foreground rounded-none bg-transparent px-1 font-medium text-base focus:outline-none focus:border-primary placeholder:text-muted-foreground/50"
      />
    </span>
  );
};

const ShowPrep = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const selectedDateFormatted = format(selectedDate, "EEEE, MMMM do yyyy");
  const isFriday = checkIsFriday(selectedDate);
  const isSelectedToday = isToday(selectedDate);

  const loadTopics = useCallback((date: Date): ShowPrepTopics => {
    const stored = localStorage.getItem(getStorageKey("show-prep-topics", date));
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { fromTopic: "", toTopic: "", andTopic: "" };
      }
    }
    return { fromTopic: "", toTopic: "", andTopic: "" };
  }, []);


  const loadLastMinute = useCallback((date: Date): string => {
    return localStorage.getItem(getStorageKey("show-prep-last-minute", date)) || "";
  }, []);

  const [topics, setTopics] = useState<ShowPrepTopics>(() => loadTopics(new Date()));
  const [lastMinuteFrom, setLastMinuteFrom] = useState<string>(() => loadLastMinute(new Date()));

  // Load data when date changes
  useEffect(() => {
    setTopics(loadTopics(selectedDate));
    setLastMinuteFrom(loadLastMinute(selectedDate));
  }, [selectedDate, loadTopics, loadLastMinute]);

  // Save topics and last minute when they change (auto-save)
  useEffect(() => {
    localStorage.setItem(getStorageKey("show-prep-topics", selectedDate), JSON.stringify(topics));
  }, [topics, selectedDate]);

  useEffect(() => {
    localStorage.setItem(getStorageKey("show-prep-last-minute", selectedDate), lastMinuteFrom);
  }, [lastMinuteFrom, selectedDate]);

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3 text-base leading-loose">
        {/* Date Navigation Header */}
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="icon" onClick={() => navigateDay(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <p className="text-foreground">
              It is <span className="font-semibold">{selectedDateFormatted}</span>
            </p>
            {!isSelectedToday && (
              <Button variant="link" size="sm" onClick={goToToday} className="text-xs p-0 h-auto">
                Go to Today
              </Button>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigateDay(1)}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
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
      </div>

      <div className="md:pl-6 md:border-l border-border">
        <ShowPrepNotes />
      </div>
    </div>
  );
};

export default ShowPrep;
