import { useEffect, useRef } from "react";
import { useQueueState } from "@/hooks/useQueueState";
import { useAlertQueue } from "@/hooks/useAlertQueue";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeConnection } from "@/hooks/useRealtimeConnection";

const GlobalQueueManager = () => {
  const { isPaused } = useQueueState();
  const { currentAlert, processNextAlert, handleAlertComplete } = useAlertQueue();
  const isInitializedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Use the new hook for realtime connection
  useRealtimeConnection(
    'alert-queue',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'alert_queue',
      filter: 'status=eq.completed'
    },
    async (payload) => {
      console.log('[GlobalQueueManager] Received alert completion update:', payload);
      const { data: settings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'queue_state')
        .single();
      
      const queueState = settings?.value as { isPaused: boolean } | null;
      const currentlyPaused = queueState?.isPaused ?? false;

      if (!currentlyPaused) {
        console.log('[GlobalQueueManager] Queue not paused, processing next alert');
        processNextAlert(false);
      }
    }
  );

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    const initializeQueue = async () => {
      const { data: settings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'queue_state')
        .single();
      
      const queueState = settings?.value as { isPaused: boolean } | null;
      const currentlyPaused = queueState?.isPaused ?? false;
      
      if (!currentAlert && !currentlyPaused) {
        console.log('[GlobalQueueManager] No current alert and queue not paused, processing initial alert');
        processNextAlert(false);
      }
    };

    initializeQueue();
  }, [currentAlert, processNextAlert]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (currentAlert && !isPaused) {
      console.log('[GlobalQueueManager] Setting up alert timer for:', currentAlert.alert?.title);

      // For video alerts, we rely on the video's natural end event
      if (currentAlert.alert?.media_type.startsWith('video')) {
        console.log('[GlobalQueueManager] Video alert detected, using natural end event');
        return;
      }

      // For other alerts, use the display duration
      const displayDuration = currentAlert.alert?.display_duration ?? 5;
      const timeout = displayDuration * 1000;

      console.log('[GlobalQueueManager] Setting timer for', timeout, 'ms');
      timerRef.current = setTimeout(async () => {
        try {
          console.log('[GlobalQueueManager] Timer completed, handling alert completion');
          await handleAlertComplete();
        } catch (error) {
          console.error('[GlobalQueueManager] Error completing alert:', error);
          setTimeout(async () => {
            try {
              await handleAlertComplete();
            } catch (retryError) {
              console.error('[GlobalQueueManager] Retry error completing alert:', retryError);
            }
          }, 2000);
        }
      }, timeout);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentAlert, isPaused, handleAlertComplete]);

  return null;
};

export default GlobalQueueManager;