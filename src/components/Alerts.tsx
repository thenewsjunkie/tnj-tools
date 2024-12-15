import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import AddAlertDialog from "./alerts/AddAlertDialog";
import AlertButton from "./alerts/AlertButton";
import AlertsHeader from "./alerts/AlertsHeader";
import QueueManager from "./alerts/QueueManager";
import { useQueueState } from "@/hooks/useQueueState";
import { useAlerts } from "@/hooks/useAlerts";
import { useAlertQueue } from "@/hooks/useAlertQueue";
import { useTheme } from "@/components/theme/ThemeProvider";

const Alerts = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isPaused, togglePause } = useQueueState();
  const { alerts, refetch } = useAlerts();
  const { currentAlert, queueCount, processNextAlert } = useAlertQueue();
  const { theme } = useTheme();

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
    <div className={`rounded-lg border ${bgColor} text-card-foreground shadow-sm border-border`}>
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

      <AddAlertDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAlertAdded={handleAlertAdded}
      />
    </div>
  );
};

export default Alerts;