import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import AddAlertDialog from "./alerts/AddAlertDialog";
import AlertsHeader from "./alerts/AlertsHeader";
import QueueManager from "./alerts/QueueManager";
import AlertSelector from "./alerts/AlertSelector";
import AlertStatus from "./alerts/AlertStatus";
import { useQueueState } from "@/hooks/useQueueState";
import { useAlerts } from "@/hooks/useAlerts";
import { useAlertQueue } from "@/hooks/useAlertQueue";
import { useTheme } from "@/components/theme/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";

const Alerts = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [totalAlertsSent, setTotalAlertsSent] = useState(0);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const { toast } = useToast();
  const { isPaused, togglePause } = useQueueState();
  const { alerts, refetch } = useAlerts();
  const { currentAlert, queueCount, processNextAlert } = useAlertQueue();
  const { theme } = useTheme();

  useEffect(() => {
    if (alerts && alerts.length > 0) {
      const savedAlertId = localStorage.getItem('selectedAlertId');
      if (savedAlertId) {
        const savedAlert = alerts.find(alert => alert.id === savedAlertId);
        if (savedAlert) {
          setSelectedAlert(savedAlert);
          return;
        }
      }
      // If no saved alert or saved alert not found, select first alert
      setSelectedAlert(alerts[0]);
      localStorage.setItem('selectedAlertId', alerts[0].id);
    }
  }, [alerts]);

  useEffect(() => {
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

    const channel = supabase.channel('alert-queue-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'alert_queue',
          filter: 'status=eq.completed'
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
    if (alerts && alerts.length > 0) {
      setSelectedAlert(alerts[0]);
    } else {
      setSelectedAlert(null);
      localStorage.removeItem('selectedAlertId');
    }
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

      <div className="p-6 pt-0">
        {selectedAlert && (
          <AlertSelector
            selectedAlert={selectedAlert}
            alerts={alerts}
            onAlertSelect={setSelectedAlert}
            onAlertDeleted={handleAlertDeleted}
          />
        )}
      </div>

      <AlertStatus 
        isPaused={isPaused}
        totalAlertsSent={totalAlertsSent}
      />

      <AddAlertDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAlertAdded={handleAlertAdded}
      />
    </div>
  );
};

export default Alerts;
