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
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
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
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
        
        // Reset processing flag
        isProcessingRef.current = false;
        
        if (!currentlyPaused) {
          processNextAlert(false);
        }

        // Reset completing alert id after a short delay
        setTimeout(() => {
          if (completingAlertIdRef.current === payload.new.id) {
            completingAlertIdRef.current = null;
          }
        }, 1000);
      }
    }
  );

  // Set up initial alert timer and heartbeat when a new alert starts
  useEffect(() => {
    if (currentAlert?.id && !isProcessingRef.current) {
      console.log('[GlobalQueueManager] Setting up new alert:', currentAlert.id);
      
      // Set processing flag
      isProcessingRef.current = true;

      // Set up cleanup timer based on alert duration
      const defaultDuration = 5000; // 5 seconds default
      const defaultMaxDuration = 10000; // 10 seconds default
      
      const duration = currentAlert.duration || defaultDuration;
      const maxDuration = currentAlert.max_duration || defaultMaxDuration;
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      timerRef.current = setTimeout(async () => {
        console.log('[GlobalQueueManager] Checking if alert needs cleanup');
        const { data: currentState } = await supabase
          .from('alert_queue')
          .select('status, state_changed_at')
          .eq('id', currentAlert.id)
          .single();
          
        if (currentState?.status === 'playing' && completingAlertIdRef.current !== currentAlert.id) {
          console.log('[GlobalQueueManager] Alert appears stuck, forcing completion');
          completingAlertIdRef.current = currentAlert.id;
          
          await supabase
            .from('alert_queue')
            .update({ 
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', currentAlert.id);
            
          // Reset completing alert id after a short delay
          setTimeout(() => {
            if (completingAlertIdRef.current === currentAlert.id) {
              completingAlertIdRef.current = null;
            }
          }, 1000);
        }
      }, maxDuration);

      // Set up heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      heartbeatIntervalRef.current = setInterval(async () => {
        console.log('[GlobalQueueManager] Sending heartbeat for alert:', currentAlert.id);
        const { error } = await supabase
          .from('alert_queue')
          .update({ 
            last_heartbeat: new Date().toISOString()
          })
          .eq('id', currentAlert.id)
          .eq('status', 'playing');

        if (error) {
          console.error('[GlobalQueueManager] Error sending heartbeat:', error);
        }
      }, 5000);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
      };
    }
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, []);

  return null;
};

export default GlobalQueueManager;