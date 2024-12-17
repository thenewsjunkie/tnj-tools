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

  useEffect(() => {
    console.log('[useQueueState] Setting up queue state subscription');
    
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

      const value = data?.value as unknown as QueueStateValue;
      if (value && typeof value === 'object' && 'isPaused' in value) {
        console.log('[useQueueState] Setting initial pause state:', value.isPaused);
        setIsPaused(!!value.isPaused);
      }
    };

    // Load initial state
    loadPauseState();

    // Set up realtime subscription for both database changes and broadcast channel
    const channel = supabase.channel('queue-state')
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE',
          schema: 'public',
          table: 'system_settings',
          filter: 'key=eq.queue_state'
        },
        (payload) => {
          console.log('[useQueueState] Received database queue state update:', payload);
          const value = payload.new.value as unknown as QueueStateValue;
          if (value && typeof value === 'object' && 'isPaused' in value) {
            setIsPaused(!!value.isPaused);
          }
        }
      )
      .on(
        'broadcast',
        { event: 'queue_state_change' },
        (payload) => {
          console.log('[useQueueState] Received broadcast queue state update:', payload);
          if (payload.payload && typeof payload.payload === 'object' && 'isPaused' in payload.payload) {
            const newState = !!payload.payload.isPaused;
            console.log('[useQueueState] Updating pause state to:', newState);
            setIsPaused(newState);
          }
        }
      )
      .subscribe((status) => {
        console.log('[useQueueState] Subscription status:', status);
      });

    return () => {
      console.log('[useQueueState] Cleaning up subscription');
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

    // Create and subscribe to channel
    const channel = supabase.channel('queue-state');
    
    // Subscribe first
    await channel.subscribe();
    
    // Then broadcast the state change
    await channel.send({
      type: 'broadcast',
      event: 'queue_state_change',
      payload: { isPaused: newPausedState }
    });

    // Clean up channel
    await supabase.removeChannel(channel);

    console.log('[useQueueState] Pause state updated to:', newPausedState);
    return newPausedState;
  };

  // Calculate derived state from queue data
  const currentAlert = queueData?.find(item => item.status === 'playing');
  const pendingAlerts = queueData?.filter(item => item.status === 'pending') || [];
  const queueCount = pendingAlerts.length;

  return {
    isPaused,
    togglePause,
    currentAlert,
    pendingAlerts,
    queueCount
  };
};