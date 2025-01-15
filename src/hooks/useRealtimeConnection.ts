import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

// Generate a random initial delay between 1-3 seconds
const getInitialDelay = () => Math.floor(Math.random() * 2000) + 1000;

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
  const initialDelayRef = useRef(getInitialDelay());

  const setupChannel = () => {
    if (channelRef.current) {
      console.log(`[${channelName}] Cleaning up existing channel before setup`);
      supabase.removeChannel(channelRef.current);
    }

    console.log(`[${channelName}] Setting up new channel with initial delay: ${initialDelayRef.current}ms`);
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
          reconnectAttemptsRef.current = 0;
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = undefined;
          }
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.log(`[${channelName}] Connection lost, scheduling reconnect`);
          // Calculate exponential backoff with jitter
          const backoffDelay = Math.min(
            initialDelayRef.current * Math.pow(2, reconnectAttemptsRef.current) + 
            Math.random() * 1000, // Add random jitter
            30000 // Max delay of 30 seconds
          );
          
          console.log(`[${channelName}] Attempting to reconnect in ${backoffDelay}ms (attempt ${reconnectAttemptsRef.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            console.log(`[${channelName}] Attempting to reconnect`);
            setupChannel();
          }, backoffDelay);
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
    reconnect: setupChannel
  };
};