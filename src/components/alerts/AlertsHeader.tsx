import { Button } from "@/components/ui/button";
import { Plus, Link, Pause, Play, ToggleLeft, ToggleRight } from "lucide-react";
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
    const fetchScheduleState = async () => {
      const { data, error } = await supabase
        .from('alert_schedules')
        .select('is_enabled')
        .single();
      
      if (error) {
        console.error('Error fetching schedule state:', error);
        return;
      }
      
      setIsScheduleEnabled(data.is_enabled);
    };

    fetchScheduleState();
  }, []);

  const toggleSchedule = async () => {
    const newState = !isScheduleEnabled;
    
    const { error } = await supabase
      .from('alert_schedules')
      .update({ is_enabled: newState })
      .eq('id', (await supabase.from('alert_schedules').select('id').single()).data?.id);

    if (error) {
      console.error('Error updating schedule state:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule state",
        variant: "destructive",
      });
      return;
    }

    setIsScheduleEnabled(newState);
    toast({
      title: "Success",
      description: `Schedule ${newState ? 'enabled' : 'disabled'}`,
    });
  };

  return (
    <div className="flex flex-col space-y-1.5 p-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">Alerts</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSchedule}
            className="alert-icon hover:text-neon-red hover:bg-white/10"
          >
            {isScheduleEnabled ? 
              <ToggleRight className="h-4 w-4" /> : 
              <ToggleLeft className="h-4 w-4" />
            }
          </Button>
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