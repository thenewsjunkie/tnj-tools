import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeConnection = (
  channelName: string,
  eventConfig: {
    event: 'INSERT' | 'UPDATE' | 'DELETE';
    schema: string;
    table: string;
    filter?: string;
  },
  onEvent: (payload: any) => void
) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

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
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = undefined;
          }
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.log(`[${channelName}] Connection lost, scheduling reconnect`);
          // Attempt to reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`[${channelName}] Attempting to reconnect`);
            setupChannel();
          }, 5000);
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