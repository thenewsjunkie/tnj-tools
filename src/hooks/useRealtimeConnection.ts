import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

// Store shared channel instances
const sharedChannels: Record<string, RealtimeChannel> = {};

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

  const setupChannel = () => {
    // Check if a shared channel already exists
    if (sharedChannels[channelName]) {
      console.log(`[${channelName}] Using existing shared channel`);
      channelRef.current = sharedChannels[channelName];
      
      // Add new event listener to existing channel
      channelRef.current.on(
        'postgres_changes' as any,
        {
          event: eventConfig.event,
          schema: eventConfig.schema,
          table: eventConfig.table,
          filter: eventConfig.filter
        },
        onEvent
      );
      
      return;
    }

    console.log(`[${channelName}] Setting up new shared channel`);
    const channel = supabase.channel(channelName)
      .on(
        'postgres_changes' as any,
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
          // Store the channel instance for reuse
          sharedChannels[channelName] = channel;
        }
      });

    channelRef.current = channel;
  };

  useEffect(() => {
    setupChannel();

    return () => {
      // Only clean up if this is the last subscriber
      const channel = channelRef.current;
      if (channel) {
        // Remove this specific event listener
        channel.unsubscribe();
        
        // Check if there are any other subscribers before removing the shared channel
        const hasOtherSubscribers = Object.values(sharedChannels).includes(channel);
        if (!hasOtherSubscribers) {
          console.log(`[${channelName}] Cleaning up shared channel`);
          delete sharedChannels[channelName];
          supabase.removeChannel(channel);
        }
      }
    };
  }, [channelName]);

  return {
    channel: channelRef.current
  };
};