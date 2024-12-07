import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { webRTCService } from "@/services/webrtc";
import type { CallSession } from "@/types/calls";

interface CallStreamManagerProps {
  calls: CallSession[];
  onStreamUpdate: (callId: string, stream: MediaStream) => void;
}

export const CallStreamManager = ({ calls, onStreamUpdate }: CallStreamManagerProps) => {
  const { toast } = useToast();

  useEffect(() => {
    // Initialize video calls for connected sessions
    calls.forEach(async (call) => {
      if (call.status === 'connected') {
        try {
          console.log('Initializing connected call:', call.id);
          const localStream = await webRTCService.initializeCall(call.id);
          if (localStream) {
            onStreamUpdate(call.id, localStream);
          }

          // Handle remote stream
          webRTCService.onTrack((remoteStream) => {
            console.log('Remote stream received:', remoteStream.id);
            onStreamUpdate(call.id, remoteStream);
          });
        } catch (error) {
          console.error('Error initializing call:', error);
          toast({
            title: "Connection Error",
            description: "Failed to establish video connection",
            variant: "destructive",
          });
        }
      }
    });

    // Cleanup streams for ended calls
    return () => {
      webRTCService.cleanup();
    };
  }, [calls, onStreamUpdate, toast]);

  return null;
};