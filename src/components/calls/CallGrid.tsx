import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, PhoneCall } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { CallSession } from "@/types/calls";
import { webRTCService } from "@/services/webrtc";
import { supabase } from "@/integrations/supabase/client";

interface CallGridProps {
  calls: CallSession[];
  fullscreenCall: string | null;
  onFullscreenChange: (callId: string | null) => void;
}

export const CallGrid = ({ calls, fullscreenCall, onFullscreenChange }: CallGridProps) => {
  const [streams, setStreams] = useState<{ [key: string]: MediaStream }>({});
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const { toast } = useToast();

  // Sort calls to show newest first
  const sortedCalls = [...calls].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleDelete = async (callId: string) => {
    try {
      const { error } = await supabase
        .from('call_sessions')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('id', callId);

      if (error) throw error;

      toast({
        title: "Call ended",
        description: "The call has been successfully ended",
      });

      // Cleanup WebRTC connection
      webRTCService.cleanup();
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
      }

      // Handle remote stream
      webRTCService.onTrack((remoteStream) => {
        console.log('Remote stream received:', remoteStream.id);
        setStreams(prev => ({
          ...prev,
          [callId]: remoteStream
        }));
      });

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

  useEffect(() => {
    // Initialize video calls for connected sessions
    sortedCalls.forEach(async (call) => {
      if (call.status === 'connected' && !streams[call.id]) {
        try {
          console.log('Initializing connected call:', call.id);
          const localStream = await webRTCService.initializeCall(call.id);
          if (localStream) {
            setStreams(prev => ({
              ...prev,
              [call.id]: localStream
            }));
          }
        } catch (error) {
          console.error('Error initializing call:', error);
        }
      }
    });

    // Cleanup streams for ended calls
    Object.keys(streams).forEach(streamId => {
      if (!sortedCalls.find(call => call.id === streamId)) {
        webRTCService.cleanup();
        setStreams(prev => {
          const newStreams = { ...prev };
          delete newStreams[streamId];
          return newStreams;
        });
      }
    });
  }, [sortedCalls, streams]);

  useEffect(() => {
    // Attach streams to video elements
    Object.entries(streams).forEach(([callId, stream]) => {
      const videoElement = videoRefs.current[callId];
      if (videoElement && stream && videoElement.srcObject !== stream) {
        console.log('Attaching stream to video element:', callId);
        videoElement.srcObject = stream;
        videoElement.play().catch(error => {
          console.error('Error playing video:', error);
        });
      }
    });
  }, [streams]);

  const gridClassName = fullscreenCall
    ? "grid grid-cols-1"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

  return (
    <div className={gridClassName}>
      {sortedCalls.map((call) => (
        <Card
          key={call.id}
          className={`relative overflow-hidden ${
            fullscreenCall === call.id ? 'col-span-full aspect-video' : 'aspect-video'
          }`}
          onClick={() => onFullscreenChange(fullscreenCall === call.id ? null : call.id)}
        >
          <video
            ref={el => videoRefs.current[call.id] = el}
            autoPlay
            playsInline
            muted={call.is_muted}
            className="w-full h-full object-cover bg-black"
          />
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            {call.status === 'waiting' && (
              <Button
                variant="default"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConnectCall(call.id);
                }}
              >
                <PhoneCall className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(call.id);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white">
            <p className="text-sm truncate">{call.caller_name}</p>
            {call.topic && <p className="text-xs truncate text-gray-300">{call.topic}</p>}
            <p className="text-xs text-primary">{call.status}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};