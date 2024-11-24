import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SessionData } from "../types";

export const useSessionSubscription = (
  sessionId: string | null,
  deviceId: string | null,
  isHost: boolean,
  onDisconnect: () => void
) => {
  useEffect(() => {
    if (!sessionId || !deviceId) return;

    const subscription = supabase
      .channel(`session_${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'screen_share_sessions',
        filter: `id=eq.${sessionId}`
      }, (payload) => {
        const newData = payload.new as SessionData;
        const isStillConnected = isHost 
          ? newData.host_device_id === deviceId 
          : newData.viewer_device_id === deviceId;
        
        if (!isStillConnected || !newData.is_active) {
          onDisconnect();
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [sessionId, deviceId, isHost, onDisconnect]);
};