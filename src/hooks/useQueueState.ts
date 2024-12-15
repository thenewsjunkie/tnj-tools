import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface QueueState {
  isPaused: boolean;
}

export const useQueueState = () => {
  const [isPaused, setIsPaused] = useState(true);

  useEffect(() => {
    const fetchQueueState = async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'queue_state')
        .single();
      
      if (!error && data) {
        const queueState = (data.value as unknown) as QueueState;
        setIsPaused(queueState.isPaused);
      }
    };

    fetchQueueState();

    // Subscribe to queue state changes
    const channel = supabase
      .channel('system_settings')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'system_settings',
          filter: 'key=eq.queue_state'
        },
        (payload) => {
          const queueState = (payload.new?.value as unknown) as QueueState;
          if (queueState?.isPaused !== undefined) {
            setIsPaused(queueState.isPaused);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const togglePause = async () => {
    const newPausedState = !isPaused;
    
    const { error } = await supabase
      .from('system_settings')
      .update({ 
        value: { isPaused: newPausedState } as unknown as Json,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'queue_state');

    if (error) {
      console.error('Error updating queue state:', error);
      return;
    }

    setIsPaused(newPausedState);
    return newPausedState;
  };

  return { isPaused, togglePause };
};