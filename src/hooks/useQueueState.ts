import { useState, useEffect } from "react";
import { useQueueData } from "./useQueueData";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface QueueStateValue {
  isPaused: boolean;
}

export const useQueueState = () => {
  const [isPaused, setIsPaused] = useState(false);
  const { queueData } = useQueueData();

  // Load initial pause state
  useEffect(() => {
    const loadPauseState = async () => {
      console.log('[useQueueState] Loading initial pause state');
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'queue_state')
        .single();

      if (error) {
        console.error('[useQueueState] Error loading pause state:', error);
        return;
      }

      const value = data?.value as unknown as QueueStateValue;
      if (value && typeof value === 'object' && 'isPaused' in value) {
        console.log('[useQueueState] Setting initial pause state:', value.isPaused);
        setIsPaused(!!value.isPaused);
      }
    };

    loadPauseState();

    // Subscribe to changes in system_settings
    const channel = supabase.channel('queue-state-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'system_settings',
          filter: 'key=queue_state'
        },
        (payload) => {
          const value = (payload.new as { value: Json }).value as unknown as QueueStateValue;
          if (value && typeof value === 'object' && 'isPaused' in value) {
            console.log('[useQueueState] Received queue state update:', value.isPaused);
            setIsPaused(!!value.isPaused);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
        value: { isPaused: newPausedState } as unknown as Json,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('[useQueueState] Error updating pause state:', error);
      // Revert local state if database update fails
      setIsPaused(isPaused);
      return isPaused;
    }

    console.log('[useQueueState] Pause state updated to:', newPausedState);
    return newPausedState;
  };

  // Calculate derived state from queue data
  const currentAlert = queueData?.find(item => item.status === 'playing');
  const pendingAlerts = queueData?.filter(item => item.status === 'pending') || [];
  const queueCount = (queueData || []).length;

  return {
    isPaused,
    togglePause,
    currentAlert,
    pendingAlerts,
    queueCount
  };
};