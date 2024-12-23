import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ChevronDown } from "lucide-react";
import AddAlertDialog from "./alerts/AddAlertDialog";
import AlertButton from "./alerts/AlertButton";
import AlertsHeader from "./alerts/AlertsHeader";
import QueueManager from "./alerts/QueueManager";
import { useQueueState } from "@/hooks/useQueueState";
import { useAlerts } from "@/hooks/useAlerts";
import { useAlertQueue } from "@/hooks/useAlertQueue";
import { useTheme } from "@/components/theme/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
    if (alerts && alerts.length > 0 && !selectedAlert) {
      setSelectedAlert(alerts[0]);
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex gap-2">
                <AlertButton 
                  alert={selectedAlert} 
                  onAlertDeleted={handleAlertDeleted}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-[200px] bg-background border-border"
            >
              {alerts?.map((alert) => (
                <Button
                  key={alert.id}
                  variant="ghost"
                  className="w-full justify-start px-2 py-1.5 text-sm"
                  onClick={() => setSelectedAlert(alert)}
                >
                  {alert.title}
                </Button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="absolute bottom-3 left-4 text-xs text-muted-foreground">
        Queue Status: {isPaused ? 'Paused' : 'Playing'}
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