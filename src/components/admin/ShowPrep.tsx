import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import ShowPrepNotes from "./show-prep/ShowPrepNotes";

const STORAGE_KEY = "show-prep-topics";

interface ShowPrepTopics {
  fromTopic: string;
  toTopic: string;
  andTopic: string;
}

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
  }, [topics]);

  const handleChange = (field: keyof ShowPrepTopics, value: string) => {
    setTopics(prev => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    setTopics({ fromTopic: "", toTopic: "", andTopic: "" });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2 text-sm leading-relaxed">
        {/* Line 1: Auto-filled date */}
        <p className="text-foreground">
          It is <span className="font-semibold">{todayFormatted}</span>
        </p>
        
        {/* Line 2: From topic */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-foreground">Lots to get to today from</span>
          <Input
            value={topics.fromTopic}
            onChange={(e) => handleChange("fromTopic", e.target.value)}
            placeholder="topic..."
            className="h-7 flex-1 min-w-40 inline-flex border-0 border-b border-muted-foreground/30 rounded-none bg-transparent px-1 focus-visible:ring-0 focus-visible:border-primary"
          />
        </div>
        
        {/* Line 3: To topic */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-foreground">to</span>
          <Input
            value={topics.toTopic}
            onChange={(e) => handleChange("toTopic", e.target.value)}
            placeholder="topic..."
            className="h-7 flex-1 min-w-40 inline-flex border-0 border-b border-muted-foreground/30 rounded-none bg-transparent px-1 focus-visible:ring-0 focus-visible:border-primary"
          />
        </div>
        
        {/* Line 4: And topic */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-foreground">and</span>
          <Input
            value={topics.andTopic}
            onChange={(e) => handleChange("andTopic", e.target.value)}
            placeholder="topic..."
            className="h-7 flex-1 min-w-40 inline-flex border-0 border-b border-muted-foreground/30 rounded-none bg-transparent px-1 focus-visible:ring-0 focus-visible:border-primary"
          />
        </div>
        
        {/* Static closing line */}
        <p className="text-foreground">
          plus your calls, Dispatches, emails, texts & more.
        </p>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClear}
        className="text-muted-foreground hover:text-foreground"
      >
        <Trash2 className="h-3 w-3 mr-1" />
        Clear All
      </Button>

      <ShowPrepNotes />
    </div>
  );
};

export default ShowPrep;
