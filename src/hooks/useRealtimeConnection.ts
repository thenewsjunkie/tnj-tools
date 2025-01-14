import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface PostgresChangesFilter {
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  filter?: string;
}

export const useRealtimeConnection = (
  channelName: string,
  changes: PostgresChangesFilter,
  callback: (payload: any) => void
) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const setupChannel = () => {
      // Clean up existing channel if any
      if (channelRef.current) {
        console.log(`[${channelName}] Cleaning up existing channel before setup`);
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }

      // Clear any pending retry
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = undefined;
      }

      console.log(`[${channelName}] Setting up new channel`);
      
      const channel = supabase.channel(channelName, {
        config: {
          broadcast: { ack: true },
          presence: { key: '' },
        },
      });

      channelRef.current = channel;

      channel
        .on('presence_state_change', () => {
          console.log(`[${channelName}] Presence state changed`);
        })
        .on(
          'postgres_changes',
          changes,
          callback
        )
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`[${channelName}] Successfully connected`);
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            console.log(`[${channelName}] Connection lost, scheduling reconnect`);
            // Use exponential backoff for retry (15s, then 30s, then 60s)
            const retryDelay = Math.min(15000 * Math.pow(2, channel.retryCount ?? 0), 60000);
            retryTimeoutRef.current = setTimeout(setupChannel, retryDelay);
          }
        });
    };

    setupChannel();

    // Cleanup function
    return () => {
      console.log(`[${channelName}] Cleaning up subscription`);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [channelName, changes, callback]);
};