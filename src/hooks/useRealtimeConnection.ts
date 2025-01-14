import { useEffect, useRef, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 30000; // 30 seconds
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export const useRealtimeConnection = (channelName: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE' | '*', table: string, onEvent: (payload: any) => void) => {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const retryCountRef = useRef(0);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout>();

  const setupChannel = () => {
    if (channelRef.current) {
      console.log(`[${channelName}] Cleaning up existing channel before setup`);
      channelRef.current.unsubscribe();
    }

    console.log(`[${channelName}] Setting up new channel`);
    
    const channel = supabase.channel(channelName)
      .on('postgres_changes', {
        event: eventType,
        schema: 'public',
        table: table
      }, (payload) => {
        console.log(`[${channelName}] Received event:`, payload);
        onEvent(payload);
      })
      .on('system', (payload) => {
        console.log(`[${channelName}] System event:`, payload);
        if (payload.status === 'ok' && payload.message?.includes('Subscribed')) {
          setIsConnected(true);
          retryCountRef.current = 0; // Reset retry count on successful connection
          console.log(`[${channelName}] Successfully connected`);
        }
      })
      .subscribe((status) => {
        console.log(`[${channelName}] Subscription status:`, status);
        
        if (status !== 'SUBSCRIBED') {
          setIsConnected(false);
          scheduleReconnect();
        }
      });

    channelRef.current = channel;
    startHeartbeat();
  };

  const startHeartbeat = () => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }

    heartbeatTimeoutRef.current = setInterval(() => {
      if (!channelRef.current) return;

      channelRef.current.send({
        type: 'broadcast',
        event: 'heartbeat',
        payload: { timestamp: Date.now() }
      }).then((response) => {
        if (!response.ok) {
          console.log(`[${channelName}] Heartbeat failed, reconnecting...`);
          scheduleReconnect();
        }
      });
    }, HEARTBEAT_INTERVAL);
  };

  const scheduleReconnect = () => {
    const delay = Math.min(
      INITIAL_RETRY_DELAY * Math.pow(2, retryCountRef.current),
      MAX_RETRY_DELAY
    );
    
    retryCountRef.current++;
    console.log(`[${channelName}] Connection lost, scheduling reconnect in ${delay}ms`);
    
    setTimeout(() => {
      console.log(`[${channelName}] Attempting to reconnect`);
      setupChannel();
    }, delay);
  };

  useEffect(() => {
    setupChannel();
    
    return () => {
      console.log(`[${channelName}] Cleaning up connection`);
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
      if (heartbeatTimeoutRef.current) {
        clearInterval(heartbeatTimeoutRef.current);
      }
    };
  }, [channelName, eventType, table]);

  return { isConnected };
};