import { useState, useEffect } from "react";
import { useSSToolsSettings, useUpdateSSToolsSettings } from "@/hooks/useSSToolsSettings";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Clock } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "UTC",
];

const SSToolsAdmin = () => {
  const { data: settings, isLoading } = useSSToolsSettings();
  const updateMutation = useUpdateSSToolsSettings();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [dayOfWeek, setDayOfWeek] = useState("5");
  const [timeOfDay, setTimeOfDay] = useState("19:00");
  const [timezone, setTimezone] = useState("America/New_York");
  const [streamUrl, setStreamUrl] = useState("");

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (settings) {
      setDayOfWeek(String(settings.day_of_week));
      setTimeOfDay(settings.time_of_day);
      setTimezone(settings.timezone);
      setStreamUrl(settings.stream_url);
    }
  }, [settings]);

  const handleSave = () => {
    if (!settings) return;
    updateMutation.mutate(
      {
        id: settings.id,
        day_of_week: parseInt(dayOfWeek),
        time_of_day: timeOfDay,
        timezone,
        stream_url: streamUrl,
      },
      {
        onSuccess: () => toast({ title: "Saved", description: "SS Tools settings updated" }),
        onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      }
    );
  };

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading...</div>;

  const liveTimezone = settings?.timezone ?? timezone;
  const currentTimeStr = new Intl.DateTimeFormat("en-US", {
    timeZone: liveTimezone,
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: true,
  }).format(currentTime);
  const tzAbbr = new Intl.DateTimeFormat("en-US", {
    timeZone: liveTimezone,
    timeZoneName: "short",
  }).formatToParts(currentTime).find(p => p.type === "timeZoneName")?.value ?? "";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
        <Clock className="h-4 w-4" />
        <span>Current time in {liveTimezone.replace("America/", "").replace("_", " ")}:</span>
        <span className="font-mono font-medium text-foreground">{currentTimeStr} {tzAbbr}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Day of Week</label>
          <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DAYS.map((day, i) => (
                <SelectItem key={i} value={String(i)}>{day}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Time</label>
          <Input type="time" value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Timezone</label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>{tz.replace("America/", "").replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Stream URL</label>
        <Input
          value={streamUrl}
          onChange={(e) => setStreamUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <Button onClick={handleSave} disabled={updateMutation.isPending} size="sm">
        <Save className="h-4 w-4 mr-1" />
        Save Settings
      </Button>
    </div>
  );
};

export default SSToolsAdmin;
