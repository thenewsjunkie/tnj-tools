import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

export const useRealtimeConnection = (
  channelName: string,
  eventConfig: {
    event: RealtimeEvent;
    schema: string;
    table: string;
    filter?: string;
  },
  onEvent: (payload: any) => void
) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseDelay = 1000; // Start with 1 second

  const getBackoffDelay = () => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = baseDelay * Math.pow(2, reconnectAttemptsRef.current);
    return Math.min(delay, 16000); // Cap at 16 seconds
  };

  const setupChannel = () => {
    if (channelRef.current) {
      console.log(`[${channelName}] Cleaning up existing channel before setup`);
      supabase.removeChannel(channelRef.current);
    }

    console.log(`[${channelName}] Setting up new channel`);
    channelRef.current = supabase.channel(channelName)
      .on(
        'postgres_changes',
        {
          event: eventConfig.event,
          schema: eventConfig.schema,
          table: eventConfig.table,
          filter: eventConfig.filter
        },
        (payload) => {
          console.log(`[${channelName}] Received event:`, payload);
          onEvent(payload);
        }
      )
      .on('system', { event: '*' }, (status) => {
        console.log(`[${channelName}] System event:`, status);
      })
      .subscribe((status) => {
        console.log(`[${channelName}] Subscription status:`, status);
        
        if (status === 'SUBSCRIBED') {
          console.log(`[${channelName}] Successfully connected`);
          reconnectAttemptsRef.current = 0; // Reset attempts on successful connection
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = undefined;
          }
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.log(`[${channelName}] Connection lost`);
          
          // Only attempt reconnect if we haven't exceeded max attempts
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = getBackoffDelay();
            console.log(`[${channelName}] Scheduling reconnect attempt ${reconnectAttemptsRef.current + 1} in ${delay}ms`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log(`[${channelName}] Attempting to reconnect`);
              reconnectAttemptsRef.current++;
              setupChannel();
            }, delay);
          } else {
            console.log(`[${channelName}] Max reconnection attempts reached. Please refresh the page.`);
          }
        }
      });
  };

  useEffect(() => {
    setupChannel();

    return () => {
      console.log(`[${channelName}] Cleaning up channel`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [channelName]);

  return {
    channel: channelRef.current,
    reconnect: () => {
      reconnectAttemptsRef.current = 0; // Reset attempts when manually reconnecting
      setupChannel();
    }
  };
};