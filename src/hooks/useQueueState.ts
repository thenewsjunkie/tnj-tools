import { useState, useCallback } from 'react';
import { useRealtimeConnection } from './useRealtimeConnection';
import { supabase } from "@/integrations/supabase/client";

export const useQueueState = () => {
  const [currentAlert, setCurrentAlert] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [pendingAlerts, setPendingAlerts] = useState<any[]>([]);
  const [queueCount, setQueueCount] = useState(0);

  const handleQueueEvent = useCallback((payload: any) => {
    if (payload.new && payload.new.status === 'playing') {
      console.log('[useQueueState] Current alert changed:', payload.new);
      // Ensure we have the alert data
      if (payload.new.alert) {
        setCurrentAlert(payload.new);
      }
      setIsPaused(false);
    } else if (payload.new && payload.new.status === 'completed') {
      if (currentAlert && currentAlert.id === payload.new.id) {
        console.log('[useQueueState] Current alert completed');
        setCurrentAlert(null);
      }
    }
  }, [currentAlert]);

  const togglePause = async () => {
    try {
      const newPausedState = !isPaused;
      setIsPaused(newPausedState);

      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'queue_state',
          value: { isPaused: newPausedState },
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('[useQueueState] Error updating pause state:', error);
        setIsPaused(!newPausedState); // Revert on error
        return isPaused;
      }

      return newPausedState;
    } catch (error) {
      console.error('[useQueueState] Error in togglePause:', error);
      return isPaused;
    }
  };

  useRealtimeConnection(
    'queue-state-changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'alert_queue',
      filter: `status=eq.playing`
    },
    handleQueueEvent
  );

  return {
    currentAlert,
    isPaused,
    setIsPaused,
    isConnected: true, // Simplified for now
    togglePause,
    pendingAlerts,
    queueCount
  };
};