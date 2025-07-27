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
  const mediaDurationRef = useRef<number>(0);

  // Listen for alert status changes to process next alert
  useRealtimeConnection(
    'alert-queue',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'alert_queue'
    },
    async (payload) => {
      console.log('[GlobalQueueManager] Received alert status update:', payload);
      
      // Only handle completion events to process next alert
      if (payload.old && 
          payload.old.status !== payload.new.status && 
          payload.new.status === 'completed') {
        console.log('[GlobalQueueManager] Alert completed, checking if next alert should be processed');
        
        // Clean up timers when alert completes
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        
        // Reset processing flag
        isProcessingRef.current = false;
        
        // Get current queue state
        const { data: settings } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'queue_state')
          .single();
        
        const queueState = settings?.value as { isPaused: boolean } | null;
        const currentlyPaused = queueState?.isPaused ?? false;
        
        if (!currentlyPaused) {
          // Process next alert after a small delay
          setTimeout(() => {
            processNextAlert(false);
          }, 1000);
        }
      }
    }
  );

  // Set up alert timer when a new alert starts
  useEffect(() => {
    console.log('[GlobalQueueManager] Alert effect triggered:', { 
      currentAlertId: currentAlert?.id, 
      isProcessing: isProcessingRef.current 
    });
    
    if (!currentAlert?.id) {
      // Reset processing state when there's no current alert
      isProcessingRef.current = false;
      console.log('[GlobalQueueManager] No current alert, resetting processing state');
      return;
    }

    if (isProcessingRef.current) {
      // If we're already processing an alert, clean up the existing timer
      if (timerRef.current) {
        console.log('[GlobalQueueManager] Clearing existing timer for alert processing');
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    console.log('[GlobalQueueManager] Setting up new alert:', {
      ...currentAlert,
      alert: {
        ...currentAlert.alert,
        repeat_count: currentAlert.alert.repeat_count,
        repeat_delay: currentAlert.alert.repeat_delay
      }
    });
    
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

    // Use base display duration for fallback timer (VideoAlert handles repeats internally)
    const displayDuration = Math.max(
      (currentAlert.alert.display_duration || 5) * 1000,
      mediaDurationRef.current * 1000
    );
    
    // Calculate fallback duration with repeat logic for absolute safety only
    const repeatCount = currentAlert.alert.repeat_count || 1;
    const repeatDelay = currentAlert.alert.repeat_delay || 1000;
    const fallbackDuration = (displayDuration * repeatCount) + (repeatDelay * (repeatCount - 1)) + 5000; // Extra safety buffer
    
    console.log('[GlobalQueueManager] Setting fallback timer:', {
      displayDuration,
      mediaDuration: mediaDurationRef.current,
      repeatCount,
      repeatDelay,
      fallbackDuration
    });

    // Set up fallback cleanup timer (should not normally trigger if VideoAlert completes properly)
    timerRef.current = setTimeout(async () => {
      console.log('[GlobalQueueManager] Fallback timer triggered - alert may be stuck:', {
        alertId: currentAlert.id,
        fallbackDuration,
        currentTime: new Date().toISOString()
      });
      
      // Only complete if this alert is still the current one and not already being completed
      if (completingAlertIdRef.current !== currentAlert.id) {
        completingAlertIdRef.current = currentAlert.id;
        
        const { error } = await supabase
          .from('alert_queue')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', currentAlert.id)
          .eq('status', 'playing'); // Only update if still playing
          
        if (error) {
          console.error('[GlobalQueueManager] Error completing stuck alert:', error);
        } else {
          console.log('[GlobalQueueManager] Stuck alert successfully marked as completed');
        }
      }
    }, fallbackDuration);

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

  // Method to update media duration
  const updateMediaDuration = (duration: number) => {
    mediaDurationRef.current = duration;
  };

  return null;
};

export default GlobalQueueManager;