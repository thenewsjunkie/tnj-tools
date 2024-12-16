import { useState, useEffect } from "react";
import { useQueueData } from "./useQueueData";
import { supabase } from "@/integrations/supabase/client";

export const useQueueState = () => {
  const { queueData } = useQueueData();
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Fetch initial queue state
    const fetchQueueState = async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'queue_state')
        .single();

      if (!error && data?.value) {
        console.log('[useQueueState] Initial queue state:', data.value.isPaused);
        setIsPaused(data.value.isPaused);
      }
    };

    fetchQueueState();

    // Subscribe to queue state changes
    const channel = supabase
      .channel('queue_state_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'system_settings',
          filter: 'key=eq.queue_state'
        },
        (payload) => {
          if (payload.new?.value) {
            console.log('[useQueueState] Queue state updated:', payload.new.value.isPaused);
            setIsPaused(payload.new.value.isPaused);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const currentAlert = queueData?.find(item => item.status === 'playing');
  const pendingAlerts = queueData?.filter(item => item.status === 'pending') || [];
  const queueCount = (queueData || []).length;

  const togglePause = async () => {
    const newPausedState = !isPaused;
    console.log('[useQueueState] Setting isPaused to:', newPausedState);
    setIsPaused(newPausedState);
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