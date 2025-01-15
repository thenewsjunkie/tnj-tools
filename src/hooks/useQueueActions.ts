import { supabase } from "@/integrations/supabase/client";
import { handleGiftStats } from "./useGiftQueueActions";
import { QueueStateValue, AlertQueueItem } from "@/types/queue";

export const useQueueActions = (refetchQueue: () => Promise<any>) => {
  const handleAlertComplete = async (currentAlert: AlertQueueItem) => {
    if (!currentAlert) {
      console.log('[useQueueActions] No current alert to complete');
      return;
    }

    console.log('[useQueueActions] Completing alert:', currentAlert);

    // Start a transaction to update alert status and gift stats
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

    // If this is a gift alert, update gift stats
    await handleGiftStats(currentAlert);

    console.log('[useQueueActions] Alert marked as completed');
    
    // Create and subscribe to channel before broadcasting
    const channel = supabase.channel('alert-queue');
    await channel.subscribe();
    
    // Broadcast completion event
    await channel.send({
      type: 'broadcast',
      event: 'alert_completed',
      payload: { alert_id: currentAlert.id }
    });

    console.log('[useQueueActions] Alert completion broadcasted');
    
    // Clean up channel after broadcasting
    await supabase.removeChannel(channel);
    
    // Refetch queue to update UI
    await refetchQueue();
  };

  const processNextAlert = async (isPaused: boolean, currentAlert: AlertQueueItem | null, pendingAlerts: AlertQueueItem[]) => {
    console.log('[useQueueActions] Processing next alert. Queue paused:', isPaused);
    
    // Double check pause state from database
    const { data: settings } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'queue_state')
      .single();
    
    // Type guard function to check if the value matches QueueStateValue shape
    const isQueueStateValue = (value: any): value is QueueStateValue => {
      return value && typeof value === 'object' && 'isPaused' in value && typeof value.isPaused === 'boolean';
    };

    // Safely get queue state with type checking
    const queueState = settings?.value && isQueueStateValue(settings.value) 
      ? settings.value 
      : { isPaused: false };
    
    if (queueState.isPaused || isPaused) {
      console.log('[useQueueActions] Queue is paused, not processing next alert');
      return;
    }

    // If there's a current alert playing, don't process the next one
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
      .update({ status: 'playing' })
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