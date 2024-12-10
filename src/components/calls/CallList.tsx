import React from "react";
import type { CallSession } from "@/types/calls";
import { CallCard } from "./CallCard";

interface CallListProps {
  calls: CallSession[];
  streams: { [key: string]: MediaStream };
  onConnect: (callId: string) => void;
  onDelete: (callId: string) => void;
  onFullscreenChange: (callId: string) => void;
  fullscreenCall: string | null;
}

export const CallList = ({ 
  calls, 
  streams, 
  onConnect, 
  onDelete, 
  onFullscreenChange,
  fullscreenCall 
}: CallListProps) => {
  return (
    <>
      {calls.map((call) => (
        <CallCard
          key={call.id}
          call={call}
          stream={streams[call.id]}
          onConnect={onConnect}
          onDelete={onDelete}
          onFullscreenChange={() => onFullscreenChange(fullscreenCall === call.id ? null : call.id)}
          isFullscreen={fullscreenCall === call.id}
        />
      ))}
    </>
  );
};