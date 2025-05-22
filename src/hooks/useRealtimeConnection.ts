
import { useEffect, useRef, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

// Store shared channel instances
const sharedChannels: Record<string, {
  channel: RealtimeChannel;
  subscribers: number;
  lastActivity: Date;
}> = {};

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
  const [isConnected, setIsConnected] = useState(false);
  const eventHandlerRef = useRef(onEvent);
  
  // Update the event handler ref when onEvent changes
  useEffect(() => {
    eventHandlerRef.current = onEvent;
  }, [onEvent]);

  const setupChannel = () => {
    let channel: RealtimeChannel;
    
    // Check if a shared channel already exists
    if (sharedChannels[channelName]) {
      console.log(`[RealtimeConnection] Using existing shared channel ${channelName}`);
      const sharedData = sharedChannels[channelName];
      channel = sharedData.channel;
      sharedData.subscribers += 1;
      sharedData.lastActivity = new Date();
      
      // Remove existing event listeners that might be duplicative
      channel.unsubscribe();
      
      // Re-subscribe
      channel.on(
        'postgres_changes' as any,
        {
          event: eventConfig.event,
          schema: eventConfig.schema,
          table: eventConfig.table,
          filter: eventConfig.filter
        },
        (payload) => {
          console.log(`[RealtimeConnection:${channelName}] Received event:`, payload);
          sharedChannels[channelName].lastActivity = new Date();
          eventHandlerRef.current(payload);
        }
      ).subscribe((status) => {
        console.log(`[RealtimeConnection:${channelName}] Subscription status:`, status);
        setIsConnected(status === 'SUBSCRIBED');
      });
    } else {
      // Create a new channel
      console.log(`[RealtimeConnection] Setting up new shared channel ${channelName}`);
      channel = supabase.channel(channelName)
        .on(
          'postgres_changes' as any,
          {
            event: eventConfig.event,
            schema: eventConfig.schema,
            table: eventConfig.table,
            filter: eventConfig.filter
          },
          (payload) => {
            console.log(`[RealtimeConnection:${channelName}] Received event:`, payload);
            if (sharedChannels[channelName]) {
              sharedChannels[channelName].lastActivity = new Date();
            }
            eventHandlerRef.current(payload);
          }
        )
        .on('system', { event: '*' }, (status) => {
          console.log(`[RealtimeConnection:${channelName}] System event:`, status);
        })
        .on('presence', { event: 'sync' }, () => {
          console.log(`[RealtimeConnection:${channelName}] Presence sync`);
        })
        .on('presence', { event: 'join' }, ({ key }) => {
          console.log(`[RealtimeConnection:${channelName}] Join event:`, key);
        })
        .on('presence', { event: 'leave' }, ({ key }) => {
          console.log(`[RealtimeConnection:${channelName}] Leave event:`, key);
        })
        .subscribe((status) => {
          console.log(`[RealtimeConnection:${channelName}] Subscription status:`, status);
          setIsConnected(status === 'SUBSCRIBED');
          
          if (status === 'SUBSCRIBED') {
            console.log(`[RealtimeConnection:${channelName}] Successfully connected`);
            
            // Store the channel instance for reuse
            if (!sharedChannels[channelName]) {
              sharedChannels[channelName] = {
                channel,
                subscribers: 1,
                lastActivity: new Date()
              };
            }
          } else if (status === 'CHANNEL_ERROR') {
            console.error(`[RealtimeConnection:${channelName}] Channel error`);
            
            // Attempt to reconnect after a delay
            setTimeout(() => {
              if (channelRef.current === channel) {
                console.log(`[RealtimeConnection:${channelName}] Attempting to reconnect...`);
                channel.subscribe();
              }
            }, 5000);
          }
        });
    }

    channelRef.current = channel;
    return channel;
  };

  useEffect(() => {
    const channel = setupChannel();

    // Set up a reconnection mechanism
    const checkConnection = setInterval(() => {
      if (channelRef.current && !isConnected) {
        console.log(`[RealtimeConnection:${channelName}] Connection check failed, attempting to reconnect...`);
        channelRef.current.subscribe();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(checkConnection);
      
      // Manage shared channel lifecycle
      const sharedData = sharedChannels[channelName];
      if (sharedData) {
        sharedData.subscribers -= 1;
        
        console.log(`[RealtimeConnection:${channelName}] Unsubscribing. Remaining subscribers: ${sharedData.subscribers}`);
        
        // If no more subscribers, remove the shared channel after a grace period
        if (sharedData.subscribers <= 0) {
          console.log(`[RealtimeConnection:${channelName}] No more subscribers, scheduling cleanup`);
          
          setTimeout(() => {
            // Double check if no new subscribers joined during the grace period
            if (sharedChannels[channelName] && sharedChannels[channelName].subscribers <= 0) {
              console.log(`[RealtimeConnection:${channelName}] Cleaning up shared channel`);
              
              const channelToRemove = sharedChannels[channelName].channel;
              delete sharedChannels[channelName];
              
              // Unsubscribe and remove the channel
              channelToRemove.unsubscribe();
              supabase.removeChannel(channelToRemove);
            }
          }, 10000); // 10 second grace period
        }
      }
    };
  }, [channelName]);

  return {
    channel: channelRef.current,
    isConnected
  };
};
