import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AddAlertDialog from "./alerts/AddAlertDialog";
import AlertButton from "./alerts/AlertButton";
import AlertsHeader from "./alerts/AlertsHeader";
import QueueManager from "./alerts/QueueManager";
import { useQuery } from "@tanstack/react-query";

interface QueueState {
  isPaused: boolean;
}

const Alerts = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const { toast } = useToast();

  // Fetch and sync queue state
  useEffect(() => {
    const fetchQueueState = async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'queue_state')
        .single();
      
      if (!error && data) {
        const queueState = data.value as QueueState;
        setIsPaused(queueState.isPaused);
      }
    };

    fetchQueueState();

    // Subscribe to queue state changes
    const channel = supabase
      .channel('system_settings')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'system_settings',
          filter: 'key=eq.queue_state'
        },
        (payload) => {
          const queueState = payload.new?.value as QueueState;
          if (queueState?.isPaused !== undefined) {
            setIsPaused(queueState.isPaused);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const { data: alerts, refetch } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      console.log('Fetching alerts...');
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching alerts:', error);
        throw error;
      }
      console.log('Fetched alerts:', data);
      return data;
    }
  });

  const { data: queueData, refetch: refetchQueue } = useQuery({
    queryKey: ['alert_queue'],
    queryFn: async () => {
      console.log('Fetching queue...');
      const { data, error } = await supabase
        .from('alert_queue')
        .select(`
          *,
          alert:alerts(*)
        `)
        .in('status', ['pending', 'playing'])
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (error) {
        console.error('Error fetching queue:', error);
        throw error;
      }
      console.log('Queue data fetched:', data);
      return data;
    },
    refetchInterval: 1000,
  });

  const currentAlert = queueData?.find(item => item.status === 'playing');
  const pendingAlerts = queueData?.filter(item => item.status === 'pending') || [];
  const queueCount = (currentAlert ? 1 : 0) + pendingAlerts.length;

  const processNextAlert = async () => {
    if (isPaused) {
      console.log('Queue is paused, not processing next alert');
      return;
    }

    if (currentAlert) {
      console.log('Current alert still playing, not processing next alert');
      return;
    }

    const nextAlert = pendingAlerts[0];
    if (!nextAlert) {
      console.log('No pending alerts in queue');
      return;
    }

    console.log('Processing next alert:', nextAlert);

    const { error } = await supabase
      .from('alert_queue')
      .update({ status: 'playing' })
      .eq('id', nextAlert.id);

    if (error) {
      console.error('Error updating alert status:', error);
      return;
    }

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

    await refetchQueue();
  };

  const togglePause = async () => {
    const newPausedState = !isPaused;
    
    // Update the persistent state in Supabase
    const { error } = await supabase
      .from('system_settings')
      .update({ 
        value: { isPaused: newPausedState } as QueueState,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'queue_state');

    if (error) {
      console.error('Error updating queue state:', error);
      return;
    }

    setIsPaused(newPausedState);
    
    if (!newPausedState) {
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
      <AlertsHeader 
        isPaused={isPaused}
        togglePause={togglePause}
        openDialog={() => setIsDialogOpen(true)}
      />

      <QueueManager
        currentAlert={currentAlert}
        queueCount={queueCount}
        isPaused={isPaused}
        processNextAlert={processNextAlert}
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