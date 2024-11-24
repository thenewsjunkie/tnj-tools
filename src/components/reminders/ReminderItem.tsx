import { AlertCircle, X, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";

interface ReminderItemProps {
  reminder: {
    id: string;
    text: string;
    datetime: string;
    is_active: boolean;
    recurring_weekly: boolean;
  };
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string, datetime: string, recurringWeekly: boolean) => void;
  isUpcoming: (datetime: string) => boolean;
}

const ReminderItem = ({ reminder, onDelete, onEdit, isUpcoming }: ReminderItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(reminder.text);
  const [editedDateTime, setEditedDateTime] = useState(reminder.datetime);
  const [editedRecurringWeekly, setEditedRecurringWeekly] = useState(reminder.recurring_weekly);
  const upcoming = isUpcoming(reminder.datetime);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleSave = () => {
    if (!editedText.trim() || !editedDateTime) {
      return;
    }
    
    onEdit(reminder.id, editedText.trim(), editedDateTime, editedRecurringWeekly);
    setIsEditing(false);
  };

  // Reset form when canceling edit
  const handleCancelEdit = () => {
    setEditedText(reminder.text);
    setEditedDateTime(reminder.datetime);
    setEditedRecurringWeekly(reminder.recurring_weekly);
    setIsEditing(false);
  };

  // Update local state when reminder prop changes
  if (!isEditing && (
    editedText !== reminder.text || 
    editedDateTime !== reminder.datetime || 
    editedRecurringWeekly !== reminder.recurring_weekly
  )) {
    setEditedText(reminder.text);
    setEditedDateTime(reminder.datetime);
    setEditedRecurringWeekly(reminder.recurring_weekly);
  }

  const formatDateTime = (datetime: string) => {
    const date = parseISO(datetime);
    const zonedDate = toZonedTime(date, timeZone);
    return format(zonedDate, 'MMM d, yyyy h:mm a');
  };

  return (
    <div
      className={`relative p-3 rounded-lg flex items-start justify-between gap-2 transition-all ${
        reminder.is_active
          ? "bg-red-500/20 border-2 border-neon-red animate-pulse"
          : upcoming
          ? "bg-blue-500/20 border border-blue-400"
          : "bg-white/5"
      } ${upcoming ? "scale-[1.02]" : ""}`}
    >
      <div className="flex items-start gap-2 flex-1">
        {(reminder.is_active || upcoming) && (
          <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${
            reminder.is_active ? "text-neon-red" : "text-blue-400"
          }`} />
        )}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full"
              />
              <Input
                type="datetime-local"
                value={editedDateTime}
                onChange={(e) => setEditedDateTime(e.target.value)}
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`recurring-${reminder.id}`}
                  checked={editedRecurringWeekly}
                  onCheckedChange={(checked) => setEditedRecurringWeekly(checked as boolean)}
                />
                <Label htmlFor={`recurring-${reminder.id}`} className="text-white">
                  Repeat weekly
                </Label>
              </div>
            </div>
          ) : (
            <>
              <p className="text-white">
                {reminder.text}
                {reminder.recurring_weekly && (
                  <span className="ml-2 text-xs bg-blue-500/20 px-2 py-0.5 rounded">
                    Weekly
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-400">
                {formatDateTime(reminder.datetime)}
              </p>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-green-400 hover:text-green-300"
              onClick={handleSave}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-red-400 hover:text-red-300"
              onClick={handleCancelEdit}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-white/50 hover:text-white"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-white/50 hover:text-white"
              onClick={() => onDelete(reminder.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ReminderItem;