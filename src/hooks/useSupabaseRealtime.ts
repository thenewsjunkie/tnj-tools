import { useEffect, useRef } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
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
  onEvent: (payload: RealtimePostgresChangesPayload<any>) => void
) => {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;
    const baseDelay = 1000;

    const setupChannel = () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      console.log(`[Realtime] Setting up channel: ${channelName}`);
      
      channelRef.current = supabase.channel(channelName);

      // Add postgres changes listener
      channelRef.current = channelRef.current
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
        .subscribe((status) => {
          console.log(`[Realtime] Channel ${channelName} status:`, status);
          
          if (status === 'SUBSCRIBED') {
            retryCount = 0;
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            if (retryCount < maxRetries) {
              const delay = Math.min(baseDelay * Math.pow(2, retryCount), 30000);
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

    setupChannel();

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