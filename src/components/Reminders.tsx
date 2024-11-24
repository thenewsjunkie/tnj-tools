import { useState, useEffect } from "react";
import { AlertCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Reminder {
  id: string;
  text: string;
  datetime: string;
  isActive: boolean;
  recurringWeekly: boolean;
}

const Reminders = () => {
  const [newReminder, setNewReminder] = useState("");
  const [newDateTime, setNewDateTime] = useState("");
  const [recurringWeekly, setRecurringWeekly] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .order('datetime', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const addReminderMutation = useMutation({
    mutationFn: async (reminder: Omit<Reminder, 'id' | 'isActive'>) => {
      const { error } = await supabase
        .from('reminders')
        .insert([{
          text: reminder.text,
          datetime: reminder.datetime,
          recurring_weekly: reminder.recurringWeekly,
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setNewReminder("");
      setNewDateTime("");
      setRecurringWeekly(false);
      toast({
        title: "Reminder added",
        description: "Your reminder has been set successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add reminder",
        variant: "destructive",
      });
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast({
        title: "Reminder deleted",
        description: "The reminder has been removed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete reminder",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    }, 1000);

    return () => clearInterval(interval);
  }, [queryClient]);

  const handleAddReminder = () => {
    if (!newReminder.trim() || !newDateTime) {
      toast({
        title: "Error",
        description: "Please enter both a reminder text and date/time",
        variant: "destructive",
      });
      return;
    }

    addReminderMutation.mutate({
      text: newReminder.trim(),
      datetime: newDateTime,
      recurringWeekly
    });
  };

  const isUpcoming = (datetime: string) => {
    const now = new Date();
    const reminderDate = new Date(datetime);
    const hoursDifference = (reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDifference >= 0 && hoursDifference <= 24;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
          {reminders.map((reminder) => {
            const upcoming = isUpcoming(reminder.datetime);
            return (
              <div
                key={reminder.id}
                className={`relative p-3 rounded-lg flex items-start justify-between gap-2 transition-all ${
                  reminder.is_active
                    ? "bg-red-500/20 border-2 border-neon-red animate-pulse"
                    : upcoming
                    ? "bg-blue-500/20 border border-blue-400"
                    : "bg-white/5"
                } ${upcoming ? "scale-[1.02]" : ""}`}
              >
                <div className="flex items-start gap-2">
                  {(reminder.is_active || upcoming) && (
                    <AlertCircle className={`h-5 w-5 shrink-0 mt-0.5 ${
                      reminder.is_active ? "text-neon-red" : "text-blue-400"
                    }`} />
                  )}
                  <div>
                    <p className="text-white">
                      {reminder.text}
                      {reminder.recurring_weekly && (
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
                  onClick={() => deleteReminderMutation.mutate(reminder.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default Reminders;