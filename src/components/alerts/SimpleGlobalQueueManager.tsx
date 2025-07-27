import { useEffect, useRef } from "react";
import { useQueueData } from "@/hooks/useQueueData";
import { useQueueActions } from "@/hooks/useQueueActions";
import { supabase } from "@/integrations/supabase/client";

const SimpleGlobalQueueManager = () => {
  const { queueData, refetch } = useQueueData();
  const { processNextAlert } = useQueueActions(refetch);
  const isInitializedRef = useRef(false);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get current alert
  const currentAlert = queueData?.find(item => item.status === 'playing') || null;

  // Simple heartbeat to detect stuck alerts
  useEffect(() => {
    const startHeartbeat = () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      heartbeatIntervalRef.current = setInterval(async () => {
        if (currentAlert) {
          console.log('[SimpleQueueManager] Heartbeat for alert:', currentAlert.id);
          
          // Update heartbeat timestamp
          await supabase
            .from('alert_queue')
            .update({ last_heartbeat: new Date().toISOString() })
            .eq('id', currentAlert.id);
        }
      }, 2000); // Every 2 seconds
    };

    if (currentAlert) {
      startHeartbeat();
    } else {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    }

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [currentAlert?.id]);

  // Initialize queue on mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initializeQueue = async () => {
      console.log('[SimpleQueueManager] Initializing queue');
      
      // Clean up any stuck alerts first
      await supabase
        .from('alert_queue')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('status', 'playing');

      // Process next alert if queue not paused
      const { data: settings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'queue_state')
        .single();

      const queueState = settings?.value as { isPaused: boolean } | null;
      const isPaused = queueState?.isPaused ?? false;

      if (!isPaused && !currentAlert) {
        setTimeout(() => processNextAlert(false, null, []), 500);
      }
    };

    initializeQueue();
  }, []);

  // Listen for completed alerts to process next
  useEffect(() => {
    const channel = supabase
      .channel('simple-queue-manager')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'alert_queue',
        filter: 'status=eq.completed'
      }, async (payload) => {
        // Only process if this is a fresh completion (has completed_at timestamp)
        if (payload.new.completed_at && payload.old.status === 'playing') {
          console.log('[SimpleQueueManager] Fresh alert completion:', payload.new.id);
          
          // Small delay then process next
          setTimeout(async () => {
            const { data: settings } = await supabase
              .from('system_settings')
              .select('value')
              .eq('key', 'queue_state')
              .single();

            const queueState = settings?.value as { isPaused: boolean } | null;
            const isPaused = queueState?.isPaused ?? false;

            if (!isPaused) {
              processNextAlert(false, null, []);
            }
          }, 1000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [processNextAlert]);

  return null;
};

export default SimpleGlobalQueueManager;