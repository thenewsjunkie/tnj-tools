import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";
import { format, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SegmentValue {
  day: string;
  time: string;
  description: string;
}

interface WeekendSegmentData {
  id?: string;
  week_start: string;
  hour1_segment1: string;
  hour1_segment2: string;
  hour1_segment3: string;
  am_segment1: string;
  am_segment2: string;
  am_segment3: string;
  am_segment4: string;
  am_segment5: string;
  am_segment6: string;
  am_segment7: string;
  am_segment8: string;
  best_of_notes: string;
}

const STATIONS_TEXT = "WZZR 92.1 West Palm Beach, WCZR 101.7 Treasure Coast, 970 WFLA Tampa, Z105 Sarasota, WTKS Real Radio 104.1, X 101.5 Tallahassee, 96 Rock Panama City, 97.3 Planet Radio Jacksonville Talk Radio 640 WGST Atlanta, Georgia Radio 95.1 Rochester, New York - Real Talk 97.1 New Radio 103.1/810 WGY Albany New York";

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIMES = [
  '11:00', '11:15', '11:30',
  '12:00', '12:15', '12:30',
  '1:00', '1:15', '1:30',
  '2:00', '2:15', '2:30',
  '3:00'
];

const emptyData = (): Omit<WeekendSegmentData, "week_start"> => ({
  hour1_segment1: "",
  hour1_segment2: "",
  hour1_segment3: "",
  am_segment1: "",
  am_segment2: "",
  am_segment3: "",
  am_segment4: "",
  am_segment5: "",
  am_segment6: "",
  am_segment7: "",
  am_segment8: "",
  best_of_notes: "",
});

const parseSegment = (value: string): SegmentValue => {
  if (!value) return { day: "", time: "", description: "" };
  try {
    const parsed = JSON.parse(value);
    return {
      day: parsed.day || "",
      time: parsed.time || "",
      description: parsed.description || "",
    };
  } catch {
    // Legacy plain text - put it in description
    return { day: "", time: "", description: value };
  }
};

const serializeSegment = (seg: SegmentValue): string => {
  if (!seg.day && !seg.time && !seg.description) return "";
  return JSON.stringify(seg);
};

const formatSegmentForCopy = (seg: SegmentValue): string => {
  const parts = [];
  if (seg.day) parts.push(seg.day);
  if (seg.time) parts.push(seg.time);
  if (parts.length > 0 && seg.description) {
    return `${parts.join(" ")} - ${seg.description}`;
  }
  return seg.description || "";
};

const getMonday = (date: Date): Date => {
  return startOfWeek(date, { weekStartsOn: 1 });
};

const WeekendEditionSegments = () => {
  const queryClient = useQueryClient();
  const [currentWeek, setCurrentWeek] = useState(() => getMonday(new Date()));
  const [localData, setLocalData] = useState<WeekendSegmentData | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const weekStartStr = format(currentWeek, "yyyy-MM-dd");

  const { data: weekData, isLoading } = useQuery({
    queryKey: ["weekend-segments", weekStartStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekend_segments")
        .select("*")
        .eq("week_start", weekStartStr)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (weekData) {
      setLocalData(weekData as WeekendSegmentData);
    } else {
      setLocalData({ week_start: weekStartStr, ...emptyData() });
    }
  }, [weekData, weekStartStr]);

  const saveMutation = useMutation({
    mutationFn: async (data: WeekendSegmentData) => {
      const { error } = await supabase
        .from("weekend_segments")
        .upsert(data, { onConflict: "week_start" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekend-segments", weekStartStr] });
    },
  });

  const handleChange = useCallback(
    (field: keyof WeekendSegmentData, value: string) => {
      if (!localData) return;

      const updated = { ...localData, [field]: value };
      setLocalData(updated);

      if (saveTimeout) clearTimeout(saveTimeout);
      const timeout = setTimeout(() => {
        saveMutation.mutate(updated);
      }, 1000);
      setSaveTimeout(timeout);
    },
    [localData, saveTimeout, saveMutation]
  );

  const handleSegmentChange = useCallback(
    (field: keyof WeekendSegmentData, part: keyof SegmentValue, value: string) => {
      if (!localData) return;
      const current = parseSegment(localData[field]);
      const updated = { ...current, [part]: value };
      handleChange(field, serializeSegment(updated));
    },
    [localData, handleChange]
  );

  const goToPreviousWeek = () => setCurrentWeek((w) => subWeeks(w, 1));
  const goToNextWeek = () => setCurrentWeek((w) => addWeeks(w, 1));

  const getFilledCount = () => {
    if (!localData) return 0;
    const fields = [
      "hour1_segment1", "hour1_segment2", "hour1_segment3",
      "am_segment1", "am_segment2", "am_segment3", "am_segment4",
      "am_segment5", "am_segment6", "am_segment7", "am_segment8",
    ] as const;
    return fields.filter((f) => {
      const seg = parseSegment(localData[f]);
      return seg.description?.trim() !== "";
    }).length;
  };

  const copyToClipboard = () => {
    if (!localData) return;

    const getSegmentText = (field: keyof WeekendSegmentData) =>
      formatSegmentForCopy(parseSegment(localData[field]));

    const text = `The News Junkie Weekend Edition Segments
Week of ${format(currentWeek, "MMMM d, yyyy")}

Hour 1
Segment 1 - 12 Minutes: ${getSegmentText("hour1_segment1")}
Segment 2 - 14 Minutes: ${getSegmentText("hour1_segment2")}
Segment 3 - 15 Minutes: ${getSegmentText("hour1_segment3")}

AM Stations
Segment 1 - 8 Minutes: ${getSegmentText("am_segment1")}
Segment 2 - 12 Minutes: ${getSegmentText("am_segment2")}
Segment 3 - 8 Minutes: ${getSegmentText("am_segment3")}
Segment 4 - 12 Minutes: ${getSegmentText("am_segment4")}

Segment 5 - 8 Minutes: ${getSegmentText("am_segment5")}
Segment 6 - 12 Minutes: ${getSegmentText("am_segment6")}
Segment 7 - 8 Minutes: ${getSegmentText("am_segment7")}
Segment 8 - 12 Minutes: ${getSegmentText("am_segment8")}

Stations: ${STATIONS_TEXT}

Potential Best Of Segments:
${localData.best_of_notes}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading || !localData) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  const SegmentInput = ({
    label,
    field,
  }: {
    label: string;
    field: keyof WeekendSegmentData;
  }) => {
    const segment = parseSegment(localData[field]);

    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-32 shrink-0">{label}:</span>
        <Select
          value={segment.day}
          onValueChange={(v) => handleSegmentChange(field, "day", v)}
        >
          <SelectTrigger className="w-28 h-8 text-xs shrink-0">
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent>
            {DAYS.map((day) => (
              <SelectItem key={day} value={day}>{day}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={segment.time}
          onValueChange={(v) => handleSegmentChange(field, "time", v)}
        >
          <SelectTrigger className="w-20 h-8 text-xs shrink-0">
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            {TIMES.map((time) => (
              <SelectItem key={time} value={time}>{time}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={segment.description}
          onChange={(e) => handleSegmentChange(field, "description", e.target.value)}
          className="h-8 text-sm flex-1"
          placeholder="Description..."
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={goToPreviousWeek}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </Button>
        <span className="text-sm font-medium">
          Week of {format(currentWeek, "MMMM d, yyyy")}
        </span>
        <Button variant="ghost" size="sm" onClick={goToNextWeek}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Progress */}
      <div className="text-xs text-muted-foreground text-center">
        {getFilledCount()}/11 segments filled
      </div>

      {/* Hour 1 */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">HOUR 1</h4>
        <SegmentInput label="Seg 1 - 12 min" field="hour1_segment1" />
        <SegmentInput label="Seg 2 - 14 min" field="hour1_segment2" />
        <SegmentInput label="Seg 3 - 15 min" field="hour1_segment3" />
      </div>

      {/* AM Stations */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">AM STATIONS</h4>
        <SegmentInput label="Seg 1 - 8 min" field="am_segment1" />
        <SegmentInput label="Seg 2 - 12 min" field="am_segment2" />
        <SegmentInput label="Seg 3 - 8 min" field="am_segment3" />
        <SegmentInput label="Seg 4 - 12 min" field="am_segment4" />
        
        <div className="border-t border-border/30 my-2" />
        
        <SegmentInput label="Seg 5 - 8 min" field="am_segment5" />
        <SegmentInput label="Seg 6 - 12 min" field="am_segment6" />
        <SegmentInput label="Seg 7 - 8 min" field="am_segment7" />
        <SegmentInput label="Seg 8 - 12 min" field="am_segment8" />
      </div>

      {/* Stations */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">STATIONS</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {STATIONS_TEXT}
        </p>
      </div>

      {/* Best Of */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">POTENTIAL BEST OF SEGMENTS</h4>
        <Textarea
          value={localData.best_of_notes}
          onChange={(e) => handleChange("best_of_notes", e.target.value)}
          placeholder="Notes about potential best of segments..."
          className="min-h-[80px] text-sm"
        />
      </div>

      {/* Copy Button */}
      <Button onClick={copyToClipboard} className="w-full" variant="secondary">
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-2" />
            Copy to Clipboard
          </>
        )}
      </Button>
    </div>
  );
};

export default WeekendEditionSegments;

export const getWeekendSegmentFilledCount = async (weekStart: string): Promise<number> => {
  const { data } = await supabase
    .from("weekend_segments")
    .select("*")
    .eq("week_start", weekStart)
    .maybeSingle();

  if (!data) return 0;
  
  const fields = [
    "hour1_segment1", "hour1_segment2", "hour1_segment3",
    "am_segment1", "am_segment2", "am_segment3", "am_segment4",
    "am_segment5", "am_segment6", "am_segment7", "am_segment8",
  ] as const;
  
  return fields.filter((f) => {
    const val = (data as any)[f] || "";
    try {
      const parsed = JSON.parse(val);
      return parsed.description?.trim() !== "";
    } catch {
      return val.trim() !== "";
    }
  }).length;
};
