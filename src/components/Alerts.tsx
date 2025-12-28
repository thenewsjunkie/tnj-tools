import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import AddAlertDialog from "./alerts/AddAlertDialog";
import AlertsHeader from "./alerts/AlertsHeader";
import QueueManager from "./alerts/QueueManager";
import AlertSelector from "./alerts/AlertSelector";

import { useQueueState } from "@/hooks/useQueueState";
import { useAlerts } from "@/hooks/useAlerts";
import { useTheme } from "@/components/theme/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";

const Alerts = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const { toast } = useToast();
  const { isPaused, togglePause, currentAlert, queueCount } = useQueueState();
  const { alerts, refetch } = useAlerts();
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
    await togglePause();
    // Server-side edge function will handle queue processing automatically
  };

  return (
    <div className="space-y-3">
      <AlertsHeader 
        isPaused={isPaused}
        togglePause={handleTogglePause}
        openDialog={() => setIsDialogOpen(true)}
      />

      <QueueManager
        currentAlert={currentAlert}
        queueCount={queueCount}
        isPaused={isPaused}
      />

      {selectedAlert && (
        <AlertSelector
          selectedAlert={selectedAlert}
          alerts={alerts}
          onAlertSelect={setSelectedAlert}
          onAlertDeleted={handleAlertDeleted}
        />
      )}

      <AddAlertDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAlertAdded={handleAlertAdded}
      />
    </div>
  );
};

export default Alerts;
