import { useState } from "react";
import { Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Dubai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

interface TimezoneSelectorProps {
  currentTimezone: string;
  userId: string;
}

export const TimezoneSelector = ({ currentTimezone, userId }: TimezoneSelectorProps) => {
  const [timezone, setTimezone] = useState(currentTimezone);
  const { toast } = useToast();

  const handleTimezoneChange = async (newTimezone: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ timezone: newTimezone })
      .eq("id", userId);

    if (error) {
      console.error("Error updating timezone:", error);
      toast({
        title: "Error",
        description: "Failed to update timezone",
        variant: "destructive",
      });
      return;
    }

    setTimezone(newTimezone);
    toast({
      title: "Success",
      description: "Timezone updated successfully",
    });
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Timezone Settings</h3>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Select your preferred timezone for the application
        </p>
        <Select value={timezone} onValueChange={handleTimezoneChange}>
          <SelectTrigger className="w-full md:w-[300px]">
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};