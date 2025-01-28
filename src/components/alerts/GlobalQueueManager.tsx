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

  // Listen for ALL alert status changes
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

      // Handle different alert states
      if (payload.new.status === 'completed') {
        console.log('[GlobalQueueManager] Alert completed, processing next if not paused');
        if (!currentlyPaused) {
          processNextAlert(false);
        }
      } else if (payload.new.status === 'playing') {
        console.log('[GlobalQueueManager] Alert now playing, setting up cleanup timer');
        // Set up cleanup timer based on alert duration
        const duration = payload.new.duration || 5000;
        const maxDuration = payload.new.max_duration || duration + 5000;
        
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        
        timerRef.current = setTimeout(async () => {
          console.log('[GlobalQueueManager] Checking if alert needs cleanup');
          const { data: currentState } = await supabase
            .from('alert_queue')
            .select('status, state_changed_at')
            .eq('id', payload.new.id)
            .single();
            
          if (currentState?.status === 'playing') {
            console.log('[GlobalQueueManager] Alert appears stuck, forcing completion');
            await supabase
              .from('alert_queue')
              .update({ 
                status: 'completed',
                completed_at: new Date().toISOString()
              })
              .eq('id', payload.new.id);
          }
        }, maxDuration);
      }
    }
  );

  // Set up heartbeat for current alert
  useEffect(() => {
    if (currentAlert?.id) {
      console.log('[GlobalQueueManager] Setting up heartbeat for alert:', currentAlert.id);
      
      // Clear any existing heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      // Start new heartbeat interval
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
      }, 5000); // Send heartbeat every 5 seconds

      return () => {
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
      
      if (!currentAlert && !currentlyPaused) {
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