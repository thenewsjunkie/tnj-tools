import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import ShowPrepNotes from "./show-prep/ShowPrepNotes";

const STORAGE_KEY = "show-prep-topics";
const QUICK_NOTES_KEY = "show-prep-quick-notes";

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
  const todayFormatted = format(new Date(), "EEEE, MMMM do yyyy");
  
  const [topics, setTopics] = useState<ShowPrepTopics>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { fromTopic: "", toTopic: "", andTopic: "" };
      }
    }
    return { fromTopic: "", toTopic: "", andTopic: "" };
  });

  const [quickNotes, setQuickNotes] = useState<string>(() => {
    return localStorage.getItem(QUICK_NOTES_KEY) || "";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem(QUICK_NOTES_KEY, quickNotes);
  }, [quickNotes]);

  const handleChange = (field: keyof ShowPrepTopics, value: string) => {
    setTopics(prev => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    setTopics({ fromTopic: "", toTopic: "", andTopic: "" });
  };

  const handleClearQuickNotes = () => {
    setQuickNotes("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3 text-base leading-loose">
        {/* Line 1: Auto-filled date */}
        <p className="text-foreground">
          It is <span className="font-semibold">{todayFormatted}</span>
        </p>
        
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

        {/* Quick Notes Section */}
        <div className="mt-4 space-y-2">
          <label className="text-sm font-medium text-foreground">Quick Notes</label>
          <Textarea
            value={quickNotes}
            onChange={(e) => setQuickNotes(e.target.value)}
            placeholder="Jot down quick reminders..."
            className="min-h-[80px] text-sm resize-y"
          />
          {quickNotes && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearQuickNotes}
              className="text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear Notes
            </Button>
          )}
        </div>
      </div>

      <div className="md:pl-6 md:border-l border-border">
        <ShowPrepNotes />
      </div>
    </div>
  );
};

export default ShowPrep;
