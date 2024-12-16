import { Button } from "@/components/ui/button";
import { Plus, Link, Pause, Play, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AlertsHeaderProps {
  isPaused: boolean;
  togglePause: () => void;
  openDialog: () => void;
}

const AlertsHeader = ({ isPaused, togglePause, openDialog }: AlertsHeaderProps) => {
  const [isScheduleEnabled, setIsScheduleEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchScheduleStatus = async () => {
      const { data, error } = await supabase
        .from('alert_schedules')
        .select('is_enabled')
        .limit(1)
        .single();

      if (!error && data) {
        setIsScheduleEnabled(data.is_enabled);
      }
    };

    fetchScheduleStatus();

    // Subscribe to system_settings changes
    const channel = supabase
      .channel('system_settings_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'system_settings',
          filter: 'key=eq.queue_state'
        },
        async (payload) => {
          if (payload.new && payload.new.value && payload.new.value.isPaused !== undefined) {
            // Call togglePause if the current state doesn't match the new state
            if (isPaused !== payload.new.value.isPaused) {
              togglePause();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isPaused, togglePause]);

  const toggleSchedule = async () => {
    const newStatus = !isScheduleEnabled;
    const { error } = await supabase
      .from('alert_schedules')
      .update({ is_enabled: newStatus })
      .eq('id', (await supabase.from('alert_schedules').select('id').limit(1).single()).data?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update schedule status",
        variant: "destructive",
      });
      return;
    }

    setIsScheduleEnabled(newStatus);
    toast({
      title: "Success",
      description: `Schedule ${newStatus ? 'enabled' : 'disabled'}`,
    });
  };

  return (
    <div className="flex flex-col space-y-1.5 p-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">Alerts</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <Switch
              checked={isScheduleEnabled}
              onCheckedChange={toggleSchedule}
              className="data-[state=checked]:bg-neon-red"
            />
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={togglePause}
            className={isPaused ? "text-neon-red" : "text-neon-red"}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          <a
            href="/alerts"
            target="_blank"
            rel="noopener noreferrer"
            className="alert-icon hover:text-neon-red hover:bg-white/10 rounded-md p-2"
          >
            <Link className="h-4 w-4" />
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={openDialog}
            className="alert-icon hover:text-neon-red hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertsHeader;