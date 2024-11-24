import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReminderForm from "./reminders/ReminderForm";
import ReminderItem from "./reminders/ReminderItem";
import { format, parseISO } from "date-fns";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

const Reminders = () => {
  const [newReminder, setNewReminder] = useState("");
  const [newDateTime, setNewDateTime] = useState("");
  const [recurringWeekly, setRecurringWeekly] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .order('datetime', { ascending: true });
      
      if (error) throw error;

      // Convert UTC dates from database to local timezone
      return data.map(reminder => ({
        ...reminder,
        datetime: format(
          utcToZonedTime(parseISO(reminder.datetime), timeZone),
          "yyyy-MM-dd'T'HH:mm"
        )
      }));
    },
  });

  const addReminderMutation = useMutation({
    mutationFn: async (reminder: { text: string; datetime: string; recurringWeekly: boolean }) => {
      // Convert local time to UTC before saving
      const utcDateTime = zonedTimeToUtc(parseISO(reminder.datetime), timeZone).toISOString();
      
      const { error } = await supabase
        .from('reminders')
        .insert([{
          text: reminder.text,
          datetime: utcDateTime,
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

  const editReminderMutation = useMutation({
    mutationFn: async ({ id, text, datetime, recurringWeekly }: { 
      id: string; 
      text: string; 
      datetime: string;
      recurringWeekly: boolean;
    }) => {
      // Convert local time to UTC before saving
      const utcDateTime = zonedTimeToUtc(parseISO(datetime), timeZone).toISOString();
      
      const { error } = await supabase
        .from('reminders')
        .update({ 
          text, 
          datetime: utcDateTime,
          recurring_weekly: recurringWeekly,
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast({
        title: "Reminder updated",
        description: "Your reminder has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update reminder",
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
    const reminderDate = utcToZonedTime(parseISO(datetime), timeZone);
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
        <ReminderForm
          newReminder={newReminder}
          setNewReminder={setNewReminder}
          newDateTime={newDateTime}
          setNewDateTime={setNewDateTime}
          recurringWeekly={recurringWeekly}
          setRecurringWeekly={setRecurringWeekly}
          onAdd={handleAddReminder}
        />
        
        <div className="space-y-2">
          {reminders.map((reminder) => (
            <ReminderItem
              key={reminder.id}
              reminder={reminder}
              onDelete={(id) => deleteReminderMutation.mutate(id)}
              onEdit={(id, text, datetime, recurringWeekly) => 
                editReminderMutation.mutate({ id, text, datetime, recurringWeekly })
              }
              isUpcoming={isUpcoming}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Reminders;