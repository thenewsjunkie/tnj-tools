import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CallSession } from "@/types/calls";
import { webRTCService } from "@/services/webrtc";
import { CallStreamManager } from "./CallStreamManager";
import { CallList } from "./CallList";
import { useCallConnection } from "@/hooks/useCallConnection";

interface CallGridProps {
  calls: CallSession[];
  fullscreenCall: string | null;
  onFullscreenChange: (callId: string | null) => void;
}

export const CallGrid = ({ calls, fullscreenCall, onFullscreenChange }: CallGridProps) => {
  const { 
    streams, 
    activeCallIds, 
    handleStreamUpdate, 
    connectToCall, 
    endCall 
  } = useCallConnection();

  // Clean up old calls on component mount
  useEffect(() => {
    const cleanupOldCalls = async () => {
      try {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const { error } = await supabase
          .from('call_sessions')
          .update({ 
            status: 'ended',
            ended_at: new Date().toISOString()
          })
          .eq('status', 'connected')
          .lt('created_at', twentyFourHoursAgo.toISOString());

        if (error) {
          console.error('Error cleaning up old calls:', error);
        }
      } catch (error) {
        console.error('Error in cleanupOldCalls:', error);
      }
    };

    cleanupOldCalls();
  }, []);

  // Cleanup WebRTC connections when component unmounts
  useEffect(() => {
    return () => {
      webRTCService.cleanup();
    };
  }, []);

  // Sort calls to show newest first and filter out ended calls
  const sortedCalls = [...calls]
    .filter(call => call.status !== 'ended')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const gridClassName = fullscreenCall
    ? "grid grid-cols-1"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

  return (
    <div className={gridClassName}>
      <CallStreamManager 
        calls={sortedCalls.filter(call => activeCallIds.has(call.id))} 
        onStreamUpdate={handleStreamUpdate} 
      />
      <CallList
        calls={sortedCalls}
        streams={streams}
        onConnect={connectToCall}
        onDelete={endCall}
        onFullscreenChange={onFullscreenChange}
        fullscreenCall={fullscreenCall}
      />
    </div>
  );
};