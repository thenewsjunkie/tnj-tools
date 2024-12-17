import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import AddAlertDialog from "./alerts/AddAlertDialog";
import AlertButton from "./alerts/AlertButton";
import AlertsHeader from "./alerts/AlertsHeader";
import QueueManager from "./alerts/QueueManager";
import { useQueueState } from "@/hooks/useQueueState";
import { useAlerts } from "@/hooks/useAlerts";
import { useAlertQueue } from "@/hooks/useAlertQueue";
import { useTheme } from "@/components/theme/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";

const Alerts = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [totalAlertsSent, setTotalAlertsSent] = useState(0);
  const { toast } = useToast();
  const { isPaused, togglePause } = useQueueState();
  const { alerts, refetch } = useAlerts();
  const { currentAlert, queueCount, processNextAlert } = useAlertQueue();
  const { theme } = useTheme();

  useEffect(() => {
    // Initial fetch of completed alerts count
    const fetchTotalAlerts = async () => {
      const { count, error } = await supabase
        .from('alert_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');
      
      if (!error && count !== null) {
        setTotalAlertsSent(count);
      }
    };

    fetchTotalAlerts();

    // Subscribe to changes in alert_queue
    const channel = supabase.channel('alert-queue-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'alert_queue',
          filter: 'status=completed'
        },
        () => {
          fetchTotalAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAlertAdded = () => {
    refetch();
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Alert added successfully",
    });
  };

  const handleAlertDeleted = () => {
    refetch();
  };

  const handleTogglePause = async () => {
    const newPausedState = await togglePause();
    if (!newPausedState) {
      processNextAlert(newPausedState);
    }
  };

  const bgColor = theme === 'light' ? 'bg-white' : 'bg-black/50';

  return (
    <div className={`rounded-lg ${bgColor} text-card-foreground shadow-sm border border-gray-200 dark:border-white/10 relative pb-8`}>
      <AlertsHeader 
        isPaused={isPaused}
        togglePause={handleTogglePause}
        openDialog={() => setIsDialogOpen(true)}
      />

      <QueueManager
        currentAlert={currentAlert}
        queueCount={queueCount}
        isPaused={isPaused}
        processNextAlert={() => processNextAlert(isPaused)}
      />

      <div className="p-6 pt-0 grid gap-4 grid-cols-1">
        {alerts?.map((alert) => (
          <AlertButton 
            key={alert.id} 
            alert={alert} 
            onAlertDeleted={handleAlertDeleted}
          />
        ))}
      </div>

      <div className="absolute bottom-3 right-4 text-xs text-muted-foreground">
        Total Alerts Sent: {totalAlertsSent}
      </div>

      <AddAlertDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAlertAdded={handleAlertAdded}
      />
    </div>
  );
};

export default Alerts;