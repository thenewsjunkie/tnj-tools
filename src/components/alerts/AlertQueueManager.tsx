import { useEffect, useRef } from "react";
import { useQueueData } from "@/hooks/useQueueData";
import { supabase } from "@/integrations/supabase/client";

const AlertQueueManager = () => {
  const { queueData, refetch } = useQueueData();
  const processingRef = useRef(false);

  // Find current playing alert
  const currentAlert = queueData?.find(item => item.status === 'playing');
  const pendingAlerts = queueData?.filter(item => item.status === 'pending') || [];

  const processNextAlert = async () => {
    if (processingRef.current) return;
    if (currentAlert) return; // Already have a playing alert
    if (pendingAlerts.length === 0) return; // No pending alerts

    processingRef.current = true;
    console.log('[AlertQueueManager] Processing next alert');

    try {
      const nextAlert = pendingAlerts[0];
      console.log('[AlertQueueManager] Setting alert to playing:', nextAlert.id);

      const { error } = await supabase
        .from('alert_queue')
        .update({ 
          status: 'playing',
          state_changed_at: new Date().toISOString()
        })
        .eq('id', nextAlert.id)
        .eq('status', 'pending'); // Only update if still pending

      if (error) {
        console.error('[AlertQueueManager] Error updating alert status:', error);
      } else {
        console.log('[AlertQueueManager] Alert status updated to playing');
        await refetch();
      }
    } catch (error) {
      console.error('[AlertQueueManager] Exception processing next alert:', error);
    } finally {
      processingRef.current = false;
    }
  };

  // Process next alert when queue changes
  useEffect(() => {
    const timer = setTimeout(() => {
      processNextAlert();
    }, 100); // Small delay to avoid race conditions

    return () => clearTimeout(timer);
  }, [queueData?.length, currentAlert?.id]);

  // Listen for completed alerts
  useEffect(() => {
    const channel = supabase
      .channel('alert-queue-manager')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'alert_queue',
          filter: 'status=eq.completed'
        },
        (payload) => {
          console.log('[AlertQueueManager] Alert completed, processing next');
          // Force immediate refetch to update UI
          refetch().then(() => {
            console.log('[AlertQueueManager] Queue refetched after completion');
            setTimeout(() => {
              processNextAlert();
            }, 100); // Small delay to ensure state updates
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null; // This component manages queue but doesn't render anything
};

export default AlertQueueManager;