import { useState, useEffect, useRef } from "react";
import { useQueueData } from "./useQueueData";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeConnection } from "./useRealtimeConnection";
import { AlertQueueItem } from "@/types/queue";

export const useQueueState = () => {
  const [isPaused, setIsPaused] = useState(false);
  const { queueData } = useQueueData();
  const isInitializedRef = useRef(false);
  const prevAlertRef = useRef<AlertQueueItem | null>(null);

  // Use the new hook for realtime connection
  useRealtimeConnection(
    'queue-state-changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'system_settings',
      filter: 'key=eq.queue_state'
    },
    (payload) => {
      console.log('[useQueueState] Received database queue state update:', payload);
      if (payload.new && 'value' in payload.new) {
        const value = payload.new.value as { isPaused: boolean };
        if (value && typeof value === 'object' && 'isPaused' in value) {
          console.log('[useQueueState] Updating pause state to:', value.isPaused);
          setIsPaused(!!value.isPaused);
        }
      }
    }
  );

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    console.log('[useQueueState] Initializing queue state');
    
    const loadPauseState = async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'queue_state')
        .single();

      if (error) {
        console.error('[useQueueState] Error loading pause state:', error);
        return;
      }

      const value = data?.value as { isPaused: boolean };
      if (value && typeof value === 'object' && 'isPaused' in value) {
        console.log('[useQueueState] Setting initial pause state:', value.isPaused);
        setIsPaused(!!value.isPaused);
      }
    };

    loadPauseState();
  }, []);

  const togglePause = async () => {
    console.log('[useQueueState] Toggling pause state from:', isPaused);
    const newPausedState = !isPaused;

    // Update local state immediately for responsive UI
    setIsPaused(newPausedState);

    // Persist to database
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'queue_state',
        value: { isPaused: newPausedState },
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('[useQueueState] Error updating pause state:', error);
      // Revert local state if database update fails
      setIsPaused(isPaused);
      return isPaused;
    }

    return newPausedState;
  };

  // Calculate derived state from queue data
  const currentAlert = queueData?.find(item => item.status === 'playing') as AlertQueueItem;
  const pendingAlerts = (queueData?.filter(item => item.status === 'pending') || []) as AlertQueueItem[];
  const queueCount = pendingAlerts.length;

  // Log when current alert changes
  useEffect(() => {
    if (currentAlert?.id !== prevAlertRef.current?.id) {
      console.log('[useQueueState] Current alert changed:', {
        from: prevAlertRef.current?.id,
        to: currentAlert?.id,
        currentAlert
      });
      prevAlertRef.current = currentAlert;
    }
  }, [currentAlert]);

  return {
    isPaused,
    togglePause,
    currentAlert,
    pendingAlerts,
    queueCount
  };
};