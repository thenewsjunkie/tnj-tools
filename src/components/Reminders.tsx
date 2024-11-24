import { useState, useEffect } from "react";
import { AlertCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface Reminder {
  id: string;
  text: string;
  datetime: string;
  isActive: boolean;
  recurringWeekly: boolean;
}

const Reminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : [];
  });
  const [newReminder, setNewReminder] = useState("");
  const [newDateTime, setNewDateTime] = useState("");
  const [recurringWeekly, setRecurringWeekly] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setReminders(prevReminders => 
        prevReminders.map(reminder => {
          const reminderDate = new Date(reminder.datetime);
          const isActive = reminderDate <= now && 
                          reminderDate.getTime() + 3600000 > now.getTime();

          // If it's a weekly reminder and the time has passed, schedule it for next week
          if (reminder.recurringWeekly && reminderDate < now) {
            // Find next occurrence
            const nextDate = new Date(reminder.datetime);
            while (nextDate <= now) {
              nextDate.setDate(nextDate.getDate() + 7);
            }
            return {
              ...reminder,
              datetime: nextDate.toISOString(),
              isActive
            };
          }

          return {
            ...reminder,
            isActive
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAddReminder = () => {
    if (!newReminder.trim() || !newDateTime) {
      toast({
        title: "Error",
        description: "Please enter both a reminder text and date/time",
        variant: "destructive",
      });
      return;
    }

    const newItem: Reminder = {
      id: crypto.randomUUID(),
      text: newReminder.trim(),
      datetime: newDateTime,
      isActive: false,
      recurringWeekly: recurringWeekly
    };

    setReminders(prev => [...prev, newItem]);
    setNewReminder("");
    setNewDateTime("");
    setRecurringWeekly(false);
    toast({
      title: "Reminder added",
      description: "Your reminder has been set successfully",
    });
  };

  const handleDelete = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
    toast({
      title: "Reminder deleted",
      description: "The reminder has been removed",
    });
  };

  return (
    <Card className="bg-black/50 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-lg sm:text-xl">Reminders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
            <Button onClick={handleAddReminder} size="icon">
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
        
        <div className="space-y-2">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`relative p-3 rounded-lg flex items-start justify-between gap-2 ${
                reminder.isActive
                  ? "bg-red-500/20 border-2 border-neon-red animate-pulse"
                  : "bg-white/5"
              }`}
            >
              <div className="flex items-start gap-2">
                {reminder.isActive && (
                  <AlertCircle className="h-5 w-5 text-neon-red shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-white">
                    {reminder.text}
                    {reminder.recurringWeekly && (
                      <span className="ml-2 text-xs bg-blue-500/20 px-2 py-0.5 rounded">
                        Weekly
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(reminder.datetime).toLocaleString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-white/50 hover:text-white"
                onClick={() => handleDelete(reminder.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Reminders;