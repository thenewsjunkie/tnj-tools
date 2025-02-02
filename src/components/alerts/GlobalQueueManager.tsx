import { useEffect, useRef } from "react";
import { useQueueState } from "@/hooks/useQueueState";
import { useAlertQueue } from "@/hooks/useAlertQueue";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeConnection } from "@/hooks/useRealtimeConnection";

const GlobalQueueManager = () => {
  const { isPaused } = useQueueState();
  const { currentAlert, processNextAlert } = useAlertQueue();
  const isInitializedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const completingAlertIdRef = useRef<string | null>(null);

  // Listen for alert status changes
  useRealtimeConnection(
    'alert-queue',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'alert_queue'
    },
    async (payload) => {
      console.log('[GlobalQueueManager] Received alert status update:', payload);
      
      // Get current queue state
      const { data: settings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'queue_state')
        .single();
      
      const queueState = settings?.value as { isPaused: boolean } | null;
      const currentlyPaused = queueState?.isPaused ?? false;

      // Only handle actual status changes and prevent duplicate completions
      if (payload.old && 
          payload.old.status !== payload.new.status && 
          payload.new.status === 'completed' &&
          completingAlertIdRef.current !== payload.new.id) {
        console.log('[GlobalQueueManager] Status changed from', payload.old.status, 'to', payload.new.status);
        
        completingAlertIdRef.current = payload.new.id;
        
        // Clean up any existing timers
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        
        // Reset processing flag when alert completes
        isProcessingRef.current = false;
        
        if (!currentlyPaused) {
          // Add a small delay before processing the next alert
          setTimeout(() => {
            processNextAlert(false);
          }, 1000);
        }

        // Reset completing alert id after a delay
        setTimeout(() => {
          if (completingAlertIdRef.current === payload.new.id) {
            completingAlertIdRef.current = null;
          }
        }, 2000);
      }
    }
  );

  // Set up alert timer when a new alert starts
  useEffect(() => {
    if (!currentAlert?.id) {
      // Reset processing state when there's no current alert
      isProcessingRef.current = false;
      return;
    }

    if (isProcessingRef.current) {
      // If we're already processing an alert, clean up the existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    console.log('[GlobalQueueManager] Setting up new alert:', currentAlert);
    
    // Set processing flag
    isProcessingRef.current = true;

    // Update played_at timestamp when alert starts playing
    const updatePlayedAt = async () => {
      await supabase
        .from('alert_queue')
        .update({ played_at: new Date().toISOString() })
        .eq('id', currentAlert.id);
    };

    updatePlayedAt();

    // Calculate total duration based on repeat count, display duration, and repeat delay
    const displayDuration = (currentAlert.alert.display_duration || 5) * 1000;
    const repeatCount = currentAlert.alert.repeat_count || 1;
    const repeatDelay = currentAlert.alert.repeat_delay || 1000;
    
    // Add repeat delay time for each repeat after the first one
    const totalDuration = (displayDuration * repeatCount) + (repeatDelay * (repeatCount - 1));
    
    console.log('[GlobalQueueManager] Alert duration:', {
      displayDuration,
      repeatCount,
      repeatDelay,
      totalDuration
    });

    // Set up cleanup timer based on total duration
    timerRef.current = setTimeout(async () => {
      console.log('[GlobalQueueManager] Alert duration reached, completing alert');
      if (completingAlertIdRef.current !== currentAlert.id) {
        completingAlertIdRef.current = currentAlert.id;
        
        await supabase
          .from('alert_queue')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', currentAlert.id);
          
        // Reset completing alert id after a delay
        setTimeout(() => {
          if (completingAlertIdRef.current === currentAlert.id) {
            completingAlertIdRef.current = null;
          }
        }, 2000);
      }
    }, totalDuration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentAlert?.id]);

  // Initialize queue on component mount
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
      
      if (!currentAlert && !currentlyPaused && !isProcessingRef.current) {
        console.log('[GlobalQueueManager] No current alert and queue not paused, processing initial alert');
        processNextAlert(false);
      }
    };

    initializeQueue();

    // Clean up any stuck alerts on mount
    const cleanupStuckAlerts = async () => {
      const { data: stuckAlerts } = await supabase
        .from('alert_queue')
        .select('*')
        .eq('status', 'playing');

      if (stuckAlerts?.length) {
        console.log('[GlobalQueueManager] Found stuck alerts, cleaning up:', stuckAlerts);
        await supabase
          .from('alert_queue')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('status', 'playing');
      }
    };

    cleanupStuckAlerts();
  }, [currentAlert, processNextAlert]);

  return null;
};

export default GlobalQueueManager;