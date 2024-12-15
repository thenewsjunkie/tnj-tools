import { supabase } from "@/integrations/supabase/client";

export const useQueueActions = (refetchQueue: () => Promise<any>) => {
  const handleAlertComplete = async (currentAlert: any) => {
    if (!currentAlert) {
      console.log('[useQueueActions] No current alert to complete');
      return;
    }

    console.log('[useQueueActions] Completing alert:', currentAlert.id);

    const { error } = await supabase
      .from('alert_queue')
      .update({ 
        status: 'completed',
        played_at: new Date().toISOString()
      })
      .eq('id', currentAlert.id);

    if (error) {
      console.error('[useQueueActions] Error completing alert:', error);
      return;
    }

    console.log('[useQueueActions] Alert marked as completed');
    await refetchQueue();

    // Broadcast completion event
    const channel = supabase.channel('alert-queue');
    await channel.subscribe();
    await channel.send({
      type: 'broadcast',
      event: 'alert_completed',
      payload: { alert_id: currentAlert.id }
    });
  };

  const processNextAlert = async (isPaused: boolean, currentAlert: any, pendingAlerts: any[]) => {
    console.log('[useQueueActions] Processing next alert. Queue paused:', isPaused);
    
    if (isPaused) {
      console.log('[useQueueActions] Queue is paused, not processing next alert');
      return;
    }

    if (currentAlert) {
      console.log('[useQueueActions] Current alert still playing:', currentAlert.id);
      return;
    }

    const nextAlert = pendingAlerts[0];
    if (!nextAlert) {
      console.log('[useQueueActions] No pending alerts in queue');
      return;
    }

    console.log('[useQueueActions] Setting next alert to playing:', nextAlert.id);

    const { error } = await supabase
      .from('alert_queue')
      .update({ 
        status: 'playing',
      })
      .eq('id', nextAlert.id);

    if (error) {
      console.error('[useQueueActions] Error updating alert status:', error);
      return;
    }

    console.log('[useQueueActions] Alert status updated to playing');
    await refetchQueue();
  };

  return {
    handleAlertComplete,
    processNextAlert
  };
};