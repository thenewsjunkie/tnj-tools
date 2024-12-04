import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import type { CallSession } from "@/types/calls";
import { webRTCService } from "@/services/webrtc";

interface CallGridProps {
  calls: CallSession[];
  fullscreenCall: string | null;
  onFullscreenChange: (callId: string | null) => void;
}

export const CallGrid = ({ calls, fullscreenCall, onFullscreenChange }: CallGridProps) => {
  const [streams, setStreams] = useState<{ [key: string]: MediaStream }>({});
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    // Initialize video calls for new sessions
    calls.forEach(async (call) => {
      if (call.status === 'connected' && !streams[call.id]) {
        try {
          const localStream = await webRTCService.initializeCall(call.id);
          setStreams(prev => ({
            ...prev,
            [call.id]: localStream
          }));

          // Handle remote stream
          webRTCService.onTrack((remoteStream) => {
            setStreams(prev => ({
              ...prev,
              [call.id]: remoteStream
            }));
          });
        } catch (error) {
          console.error('Error initializing call:', error);
        }
      }
    });

    // Cleanup streams for ended calls
    Object.keys(streams).forEach(streamId => {
      if (!calls.find(call => call.id === streamId)) {
        webRTCService.cleanup();
        setStreams(prev => {
          const newStreams = { ...prev };
          delete newStreams[streamId];
          return newStreams;
        });
      }
    });
  }, [calls, streams]);

  useEffect(() => {
    // Attach streams to video elements
    Object.entries(streams).forEach(([callId, stream]) => {
      const videoElement = videoRefs.current[callId];
      if (videoElement && stream && videoElement.srcObject !== stream) {
        videoElement.srcObject = stream;
      }
    });
  }, [streams]);

  const gridClassName = fullscreenCall
    ? "grid grid-cols-1"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

  return (
    <div className={gridClassName}>
      {calls.map((call) => (
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
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white">
            <p className="text-sm truncate">{call.caller_name}</p>
            {call.topic && <p className="text-xs truncate text-gray-300">{call.topic}</p>}
          </div>
        </Card>
      ))}
    </div>
  );
};