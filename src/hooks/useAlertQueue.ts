import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAlertQueue = () => {
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

  const handleAlertComplete = async () => {
    if (!currentAlert) return;

    console.log('Completing alert:', currentAlert.id);

    const { error } = await supabase
      .from('alert_queue')
      .update({ 
        status: 'completed',
        played_at: new Date().toISOString()
      })
      .eq('id', currentAlert.id);

    if (error) {
      console.error('Error completing alert:', error);
      return;
    }

    await supabase
      .channel('alerts')
      .send({
        type: 'broadcast',
        event: 'alert_completed',
        payload: { alertId: currentAlert.id }
      });

    await refetchQueue();
  };

  const processNextAlert = async (isPaused: boolean) => {
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

    await refetchQueue();
  };

  return {
    currentAlert,
    queueCount,
    pendingAlerts,
    processNextAlert,
    refetchQueue,
    handleAlertComplete
  };
};