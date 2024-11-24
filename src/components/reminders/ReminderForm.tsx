import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ReminderFormProps {
  newReminder: string;
  setNewReminder: (value: string) => void;
  newDateTime: string;
  setNewDateTime: (value: string) => void;
  recurringWeekly: boolean;
  setRecurringWeekly: (value: boolean) => void;
  onAdd: () => void;
}

const ReminderForm = ({
  newReminder,
  setNewReminder,
  newDateTime,
  setNewDateTime,
  recurringWeekly,
  setRecurringWeekly,
  onAdd,
}: ReminderFormProps) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Add a reminder..."
          value={newReminder}
          onChange={(e) => setNewReminder(e.target.value)}
          className="flex-1"
        />
        <Input
          type="datetime-local"
          value={newDateTime}
          onChange={(e) => setNewDateTime(e.target.value)}
          className="w-auto"
        />
        <Button onClick={onAdd} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="recurring"
          checked={recurringWeekly}
          onCheckedChange={(checked) => setRecurringWeekly(checked as boolean)}
        />
        <Label htmlFor="recurring" className="text-white">
          Repeat weekly
        </Label>
      </div>
    </div>
  );
};

export default ReminderForm;