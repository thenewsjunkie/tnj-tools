import { useState, useEffect } from "react";
import { useQueueData } from "./useQueueData";
import { supabase } from "@/integrations/supabase/client";

interface QueueStateValue {
  isPaused: boolean;
}

export const useQueueState = () => {
  const { queueData } = useQueueData();
  const [isPaused, setIsPaused] = useState(false);

  // Load initial pause state from system_settings
  useEffect(() => {
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

      const value = data?.value as QueueStateValue;
      if (value && typeof value === 'object') {
        setIsPaused(!!value.isPaused);
      }
    };

    loadPauseState();
  }, []);

  const currentAlert = queueData?.find(item => item.status === 'playing');
  const pendingAlerts = queueData?.filter(item => item.status === 'pending') || [];
  const queueCount = (queueData || []).length;

  const togglePause = async () => {
    console.log('[useQueueState] Toggling pause state from:', isPaused);
    const newPausedState = !isPaused;

    // Update local state
    setIsPaused(newPausedState);

    // Persist to database
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'queue_state',
        value: { isPaused: newPausedState } as QueueStateValue,
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

  return {
    currentAlert,
    pendingAlerts,
    queueCount,
    isPaused,
    togglePause
  };
};