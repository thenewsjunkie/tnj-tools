import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface ChannelConfig {
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
  table: string;
  filter?: string;
}

export const useSupabaseRealtime = (
  channelName: string,
  config: ChannelConfig,
  onEvent: (payload: any) => void
) => {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;
    const baseDelay = 1000; // Start with 1 second delay

    const setupChannel = () => {
      // Clean up existing channel if any
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      console.log(`[Realtime] Setting up channel: ${channelName}`);
      
      channelRef.current = supabase.channel(channelName)
        .on(
          'postgres_changes',
          {
            event: config.event,
            schema: config.schema || 'public',
            table: config.table,
            filter: config.filter
          },
          (payload) => {
            console.log(`[Realtime] Received event on ${channelName}:`, payload);
            onEvent(payload);
          }
        )
        .on('system', { event: '*' }, (payload) => {
          console.log(`[Realtime] System event on ${channelName}:`, payload);
        })
        .on('subscription', { event: '*' }, (payload) => {
          console.log(`[Realtime] Subscription event on ${channelName}:`, payload);
        })
        .subscribe(async (status) => {
          console.log(`[Realtime] Channel ${channelName} status:`, status);
          
          if (status === 'SUBSCRIBED') {
            retryCount = 0; // Reset retry count on successful connection
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            // Implement exponential backoff for reconnection
            if (retryCount < maxRetries) {
              const delay = Math.min(baseDelay * Math.pow(2, retryCount), 30000); // Max 30 second delay
              console.log(`[Realtime] Retrying connection in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
              
              setTimeout(() => {
                retryCount++;
                setupChannel();
              }, delay);
            } else {
              console.error(`[Realtime] Failed to reconnect after ${maxRetries} attempts`);
            }
          }
        });
    };

    // Initial setup
    setupChannel();

    // Cleanup function
    return () => {
      console.log(`[Realtime] Cleaning up channel: ${channelName}`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [channelName, config, onEvent]);

  return {
    channel: channelRef.current,
  };
};