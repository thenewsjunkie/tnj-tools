import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { webRTCService } from "@/services/webrtc";
import type { CallSession } from "@/types/calls";

export const useCallConnection = () => {
  const [streams, setStreams] = useState<{ [key: string]: MediaStream }>({});
  const [activeCallIds, setActiveCallIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const cleanupCall = async (callId: string) => {
    console.log('Cleaning up call:', callId);
    setStreams(prev => {
      const newStreams = { ...prev };
      delete newStreams[callId];
      return newStreams;
    });
    
    setActiveCallIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(callId);
      return newSet;
    });

    await webRTCService.cleanup();
  };

  const handleStreamUpdate = (callId: string, stream: MediaStream) => {
    if (!activeCallIds.has(callId)) {
      console.log('Ignoring stream update for inactive call:', callId);
      return;
    }
    
    setStreams(prev => ({
      ...prev,
      [callId]: stream
    }));
  };

  const connectToCall = async (callId: string) => {
    try {
      if (activeCallIds.has(callId)) {
        console.log('Call already active:', callId);
        return;
      }

      console.log('Connecting to call:', callId);
      
      const { error: updateError } = await supabase
        .from('call_sessions')
        .update({ status: 'connected' })
        .eq('id', callId);

      if (updateError) throw updateError;

      const localStream = await webRTCService.initializeCall(callId);
      if (localStream) {
        console.log('Local stream obtained:', localStream.id);
        setStreams(prev => ({
          ...prev,
          [callId]: localStream
        }));
        
        setActiveCallIds(prev => new Set([...prev, callId]));
      }

      toast({
        title: "Connected",
        description: "Successfully connected to the call",
      });
    } catch (error) {
      console.error('Error connecting to call:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to the call. Please try again.",
        variant: "destructive",
      });
    }
  };

  const endCall = async (callId: string) => {
    try {
      const { error } = await supabase
        .from('call_sessions')
        .update({ 
          status: 'ended', 
          ended_at: new Date().toISOString() 
        })
        .eq('id', callId);

      if (error) throw error;

      await cleanupCall(callId);

      toast({
        title: "Call ended",
        description: "The call has been successfully ended",
      });
    } catch (error) {
      console.error('Error ending call:', error);
      toast({
        title: "Error",
        description: "Failed to end the call. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    streams,
    activeCallIds,
    handleStreamUpdate,
    connectToCall,
    endCall,
    cleanupCall
  };
};