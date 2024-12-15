import { useState, useEffect } from "react";
import { Plus, Link, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AddAlertDialog from "./alerts/AddAlertDialog";
import AlertButton from "./alerts/AlertButton";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const Alerts = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const { toast } = useToast();

  const { data: alerts, refetch } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: queueData, refetch: refetchQueue } = useQuery({
    queryKey: ['alert_queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_queue')
        .select(`
          *,
          alert:alerts(*)
        `)
        .in('status', ['pending', 'playing'])
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 1000, // Poll every second
  });

  const currentAlert = queueData?.find(item => item.status === 'playing');
  const pendingAlerts = queueData?.filter(item => item.status === 'pending') || [];
  const queueCount = (currentAlert ? 1 : 0) + pendingAlerts.length;

  useEffect(() => {
    const channel = supabase.channel('alert-queue')
      .on('broadcast', { event: 'alert_completed' }, async () => {
        await refetchQueue();
        // If we're not paused, automatically start the next alert
        if (!isPaused) {
          processNextAlert();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchQueue, isPaused]);

  const processNextAlert = async () => {
    if (isPaused || currentAlert) return;

    const nextAlert = pendingAlerts[0];
    if (!nextAlert) return;

    const { error } = await supabase
      .from('alert_queue')
      .update({ status: 'playing' })
      .eq('id', nextAlert.id);

    if (error) {
      console.error('Error updating alert status:', error);
      return;
    }

    // Broadcast the alert
    await supabase
      .channel('alerts')
      .send({
        type: 'broadcast',
        event: 'play_alert',
        payload: {
          ...nextAlert.alert,
          message_text: nextAlert.username 
            ? `${nextAlert.username} ${nextAlert.alert.message_text}`
            : nextAlert.alert.message_text
        }
      });

    refetchQueue();
  };

  const togglePause = async () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    
    if (newPausedState) {
      // If we're pausing, stop any currently playing alert
      if (currentAlert) {
        await supabase
          .from('alert_queue')
          .update({ status: 'pending' })
          .eq('id', currentAlert.id);
        await refetchQueue();
      }
    } else {
      // If we're unpausing, process the next alert
      processNextAlert();
    }
  };

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

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Alerts</h3>
          <div className="flex items-center gap-2">
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
              onClick={() => setIsDialogOpen(true)}
              className="alert-icon hover:text-neon-red hover:bg-white/10"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {currentAlert && (
        <div className="px-6 pb-4">
          <Alert>
            <AlertTitle>Current Alert: {currentAlert.alert.title}</AlertTitle>
            {currentAlert.alert.message_enabled && currentAlert.username && (
              <AlertDescription>
                {currentAlert.username} {currentAlert.alert.message_text}
              </AlertDescription>
            )}
            <AlertDescription className="mt-2 text-sm text-muted-foreground">
              Queue: {queueCount} alert{queueCount !== 1 ? 's' : ''}
            </AlertDescription>
          </Alert>
        </div>
      )}

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