import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

interface ScheduledSegment {
  id?: string;
  name: string;
  time: string;
  hour_block: string;
  days: number[];
  is_active: boolean;
}

interface ScheduledSegmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  segment: ScheduledSegment | null;
  onSave: (segment: Omit<ScheduledSegment, 'id'> & { id?: string }) => void;
}

const HOUR_BLOCKS = [
  { value: "hour-1", label: "Hour 1 (11:00 AM - 12:00 PM)" },
  { value: "hour-2", label: "Hour 2 (12:00 PM - 1:00 PM)" },
  { value: "hour-3", label: "Hour 3 (1:00 PM - 2:00 PM)" },
  { value: "hour-4", label: "Hour 4 (2:00 PM - 3:00 PM)" },
];

const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
];

const TIME_OPTIONS = [
  "11:00 AM", "11:15 AM", "11:30 AM", "11:45 AM",
  "12:00 PM", "12:15 PM", "12:30 PM", "12:45 PM",
  "1:00 PM", "1:15 PM", "1:30 PM", "1:45 PM",
  "2:00 PM", "2:15 PM", "2:30 PM", "2:45 PM",
];

const ScheduledSegmentDialog = ({ open, onOpenChange, segment, onSave }: ScheduledSegmentDialogProps) => {
  const [name, setName] = useState("");
  const [time, setTime] = useState("12:00 PM");
  const [hourBlock, setHourBlock] = useState("hour-1");
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (segment) {
      setName(segment.name);
      setTime(segment.time);
      setHourBlock(segment.hour_block);
      setDays(segment.days);
      setIsActive(segment.is_active);
    } else {
      setName("");
      setTime("12:00 PM");
      setHourBlock("hour-1");
      setDays([1, 2, 3, 4, 5]);
      setIsActive(true);
    }
  }, [segment, open]);

  const handleDayToggle = (day: number) => {
    setDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSave({
      id: segment?.id,
      name: name.trim(),
      time,
      hour_block: hourBlock,
      days,
      is_active: isActive,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{segment ? "Edit Segment" : "Add Segment"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Segment Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., The Next Episode"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Time</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Hour Block</Label>
              <Select value={hourBlock} onValueChange={setHourBlock}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOUR_BLOCKS.map((block) => (
                    <SelectItem key={block.value} value={block.value}>
                      {block.label.split(" ")[0]} {block.label.split(" ")[1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Days</Label>
            <div className="flex gap-3">
              {DAYS.map((day) => (
                <label key={day.value} className="flex items-center gap-1.5 cursor-pointer">
                  <Checkbox
                    checked={days.includes(day.value)}
                    onCheckedChange={() => handleDayToggle(day.value)}
                  />
                  <span className="text-sm text-foreground">{day.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="active" className="text-foreground">Active</Label>
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || days.length === 0}>
              {segment ? "Save Changes" : "Add Segment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduledSegmentDialog;
