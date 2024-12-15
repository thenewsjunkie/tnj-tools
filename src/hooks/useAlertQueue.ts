import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAlertQueue = () => {
  const { data: queueData, refetch: refetchQueue } = useQuery({
    queryKey: ['alert_queue'],
    queryFn: async () => {
      console.log('[useAlertQueue] Fetching queue...');
      const { data, error } = await supabase
        .from('alert_queue')
        .select(`
          *,
          alert:alerts(*)
        `)
        .in('status', ['pending', 'playing'])
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('[useAlertQueue] Error fetching queue:', error);
        throw error;
      }
      console.log('[useAlertQueue] Queue data fetched:', data);
      return data;
    },
    refetchInterval: 1000,
  });

  const currentAlert = queueData?.find(item => item.status === 'playing');
  const pendingAlerts = queueData?.filter(item => item.status === 'pending') || [];
  const queueCount = pendingAlerts.length;

  const handleAlertComplete = async () => {
    if (!currentAlert) {
      console.log('[useAlertQueue] No current alert to complete');
      return;
    }

    console.log('[useAlertQueue] Completing alert:', currentAlert.id);

    const { error } = await supabase
      .from('alert_queue')
      .update({ 
        status: 'completed',
        played_at: new Date().toISOString()
      })
      .eq('id', currentAlert.id);

    if (error) {
      console.error('[useAlertQueue] Error completing alert:', error);
      return;
    }

    console.log('[useAlertQueue] Alert marked as completed');
    await refetchQueue();
  };

  const processNextAlert = async (isPaused: boolean) => {
    console.log('[useAlertQueue] Processing next alert. Queue paused:', isPaused);
    
    if (isPaused) {
      console.log('[useAlertQueue] Queue is paused, not processing next alert');
      return;
    }

    if (currentAlert) {
      console.log('[useAlertQueue] Current alert still playing:', currentAlert.id);
      return;
    }

    const nextAlert = pendingAlerts[0];
    if (!nextAlert) {
      console.log('[useAlertQueue] No pending alerts in queue');
      return;
    }

    console.log('[useAlertQueue] Setting next alert to playing:', nextAlert.id);

    const { error } = await supabase
      .from('alert_queue')
      .update({ 
        status: 'playing',
      })
      .eq('id', nextAlert.id);

    if (error) {
      console.error('[useAlertQueue] Error updating alert status:', error);
      return;
    }

    console.log('[useAlertQueue] Alert status updated to playing');
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