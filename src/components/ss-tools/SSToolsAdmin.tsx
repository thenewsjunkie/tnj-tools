import { useState, useEffect } from "react";
import { useSSToolsSettings, useUpdateSSToolsSettings } from "@/hooks/useSSToolsSettings";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";

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

  const [dayOfWeek, setDayOfWeek] = useState("5");
  const [timeOfDay, setTimeOfDay] = useState("19:00");
  const [timezone, setTimezone] = useState("America/New_York");
  const [streamUrl, setStreamUrl] = useState("");

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

  return (
    <div className="space-y-4">
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
