import React, { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, PhoneCall } from "lucide-react";
import type { CallSession } from "@/types/calls";

interface CallCardProps {
  call: CallSession;
  stream: MediaStream | null;
  onConnect: (callId: string) => void;
  onDelete: (callId: string) => void;
  onFullscreenChange: (callId: string) => void;
  isFullscreen: boolean;
}

export const CallCard = ({
  call,
  stream,
  onConnect,
  onDelete,
  onFullscreenChange,
  isFullscreen,
}: CallCardProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playAttempts = useRef(0);
  const maxPlayAttempts = 3;

  const attemptPlay = async () => {
    if (!videoRef.current || !stream || playAttempts.current >= maxPlayAttempts) return;

    try {
      await videoRef.current.play();
      playAttempts.current = 0; // Reset counter on successful play
    } catch (error) {
      console.error('Error playing video:', error);
      playAttempts.current++;
      
      // Retry after a short delay if we haven't exceeded max attempts
      if (playAttempts.current < maxPlayAttempts) {
        setTimeout(attemptPlay, 1000);
      }
    }
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      attemptPlay();
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <Card
      className={`relative overflow-hidden ${
        isFullscreen ? 'col-span-full aspect-video' : 'aspect-video'
      }`}
      onClick={() => onFullscreenChange(call.id)}
    >
      <video
        ref={videoRef}
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
              onConnect(call.id);
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
            onDelete(call.id);
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
  );
};