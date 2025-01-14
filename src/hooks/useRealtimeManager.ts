import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type ChannelConfig = {
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  filter?: string;
};

const channelMap = new Map<string, RealtimeChannel>();
const subscriptionCallbacks = new Map<string, Set<(payload: RealtimePostgresChangesPayload<any>) => void>>();

const RECONNECT_DELAY = 5000;

const getChannelKey = (channelName: string, config: ChannelConfig) => 
  `${channelName}-${config.event}-${config.table}-${config.filter || ''}`;

export const useRealtimeManager = (
  channelName: string,
  config: ChannelConfig,
  onEvent: (payload: RealtimePostgresChangesPayload<any>) => void
) => {
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    const channelKey = getChannelKey(channelName, config);
    console.log(`[RealtimeManager] Setting up subscription for ${channelKey}`);

    // Add callback to the set of callbacks for this channel
    if (!subscriptionCallbacks.has(channelKey)) {
      subscriptionCallbacks.set(channelKey, new Set());
    }
    subscriptionCallbacks.get(channelKey)?.add(callbackRef.current);

    // If channel doesn't exist, create it
    if (!channelMap.has(channelKey)) {
      console.log(`[RealtimeManager] Creating new channel for ${channelKey}`);
      
      const channel = supabase.channel(channelKey, {
        config: {
          broadcast: { self: true },
          presence: { key: '' },
        }
      })
      .on('postgres_changes', {
        event: config.event,
        schema: config.schema,
        table: config.table,
        filter: config.filter
      }, (payload) => {
        console.log(`[RealtimeManager] Received event on ${channelKey}:`, payload);
        subscriptionCallbacks.get(channelKey)?.forEach(callback => callback(payload));
      })
      .subscribe((status) => {
        console.log(`[RealtimeManager] Subscription status for ${channelKey}:`, status);
        
        if (status === 'CHANNEL_ERROR') {
          console.log(`[RealtimeManager] Channel error, scheduling reconnect for ${channelKey}`);
          setTimeout(() => {
            if (channelMap.has(channelKey)) {
              const channel = channelMap.get(channelKey);
              if (channel) {
                console.log(`[RealtimeManager] Attempting to reconnect ${channelKey}`);
                channel.subscribe();
              }
            }
          }, RECONNECT_DELAY);
        }
      });

      channelMap.set(channelKey, channel);
    }

    // Cleanup
    return () => {
      console.log(`[RealtimeManager] Cleaning up subscription for ${channelKey}`);
      const callbacks = subscriptionCallbacks.get(channelKey);
      if (callbacks) {
        callbacks.delete(callbackRef.current);
        
        // If no more callbacks, remove channel
        if (callbacks.size === 0) {
          console.log(`[RealtimeManager] No more subscribers for ${channelKey}, removing channel`);
          const channel = channelMap.get(channelKey);
          if (channel) {
            supabase.removeChannel(channel);
            channelMap.delete(channelKey);
          }
          subscriptionCallbacks.delete(channelKey);
        }
      }
    };
  }, [channelName, config.event, config.schema, config.table, config.filter]);
};