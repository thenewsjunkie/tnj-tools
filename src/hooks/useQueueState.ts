import { useState, useEffect, useRef } from "react";
import { useQueueData } from "./useQueueData";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { RealtimeChannel } from "@supabase/supabase-js";

interface QueueStateValue {
  isPaused: boolean;
}

interface PostgresChangesPayload {
  new: {
    value: Json;
  };
}

export const useQueueState = () => {
  const [isPaused, setIsPaused] = useState(false);
  const { queueData } = useQueueData();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isInitializedRef = useRef(false);

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

      const value = data?.value as unknown as QueueStateValue;
      if (value && typeof value === 'object' && 'isPaused' in value) {
        console.log('[useQueueState] Setting initial pause state:', value.isPaused);
        setIsPaused(!!value.isPaused);
      }
    };

    // Load initial state
    loadPauseState();

    // Only set up subscription if we don't already have one
    if (!channelRef.current) {
      channelRef.current = supabase.channel('queue-state-changes')
        .on(
          'postgres_changes',
          { 
            event: '*',
            schema: 'public',
            table: 'system_settings',
            filter: 'key=eq.queue_state'
          },
          (payload: PostgresChangesPayload) => {
            console.log('[useQueueState] Received database queue state update:', payload);
            const value = payload.new.value as unknown as QueueStateValue;
            if (value && typeof value === 'object' && 'isPaused' in value) {
              console.log('[useQueueState] Updating pause state to:', value.isPaused);
              setIsPaused(!!value.isPaused);
            }
          }
        )
        .subscribe((status) => {
          console.log('[useQueueState] Subscription status:', status);
        });
    }

    return () => {
      if (channelRef.current) {
        console.log('[useQueueState] Cleaning up subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
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