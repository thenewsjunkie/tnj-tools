import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { CallSession } from "@/types/calls";
import { supabase } from "@/integrations/supabase/client";
import { webRTCService } from "@/services/webrtc";
import { CallCard } from "./CallCard";
import { CallStreamManager } from "./CallStreamManager";

interface CallGridProps {
  calls: CallSession[];
  fullscreenCall: string | null;
  onFullscreenChange: (callId: string | null) => void;
}

export const CallGrid = ({ calls, fullscreenCall, onFullscreenChange }: CallGridProps) => {
  const [streams, setStreams] = useState<{ [key: string]: MediaStream }>({});
  const { toast } = useToast();
  const [activeCallIds, setActiveCallIds] = useState<Set<string>>(new Set());

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

  // Monitor calls for status changes and cleanup ended calls
  useEffect(() => {
    const handleCallStatusChange = async () => {
      const activeCalls = new Set(calls
        .filter(call => call.status === 'connected')
        .map(call => call.id));
      
      // Cleanup streams and connections for ended calls
      const endedCallIds = Array.from(activeCallIds).filter(id => !activeCalls.has(id));
      
      for (const callId of endedCallIds) {
        console.log('Cleaning up ended call:', callId);
        setStreams(prev => {
          const newStreams = { ...prev };
          delete newStreams[callId];
          return newStreams;
        });
        
        await webRTCService.cleanup();
      }

      setActiveCallIds(activeCalls);
    };

    handleCallStatusChange();
  }, [calls, activeCallIds]);

  // Sort calls to show newest first and filter out ended calls
  const sortedCalls = [...calls]
    .filter(call => call.status !== 'ended')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleDelete = async (callId: string) => {
    try {
      // First update the database
      const { error } = await supabase
        .from('call_sessions')
        .update({ 
          status: 'ended', 
          ended_at: new Date().toISOString() 
        })
        .eq('id', callId);

      if (error) throw error;

      // Remove the stream and active call tracking
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

      // Cleanup WebRTC connection
      await webRTCService.cleanup();

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

  const handleConnectCall = async (callId: string) => {
    try {
      if (activeCallIds.has(callId)) {
        console.log('Call already active:', callId);
        return;
      }

      console.log('Connecting to call:', callId);
      
      // Update call status to connected
      const { error: updateError } = await supabase
        .from('call_sessions')
        .update({ status: 'connected' })
        .eq('id', callId);

      if (updateError) throw updateError;

      // Initialize WebRTC connection
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

  const gridClassName = fullscreenCall
    ? "grid grid-cols-1"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

  return (
    <div className={gridClassName}>
      <CallStreamManager 
        calls={sortedCalls.filter(call => activeCallIds.has(call.id))} 
        onStreamUpdate={handleStreamUpdate} 
      />
      {sortedCalls.map((call) => (
        <CallCard
          key={call.id}
          call={call}
          stream={streams[call.id]}
          onConnect={handleConnectCall}
          onDelete={handleDelete}
          onFullscreenChange={() => onFullscreenChange(fullscreenCall === call.id ? null : call.id)}
          isFullscreen={fullscreenCall === call.id}
        />
      ))}
    </div>
  );
};