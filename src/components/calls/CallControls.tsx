import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { webRTCService } from "@/services/webrtc";

interface CallControlsProps {
  callId: string;
  isMuted: boolean;
}

export const CallControls = ({ callId, isMuted }: CallControlsProps) => {
  const [videoEnabled, setVideoEnabled] = useState(true);

  const toggleMute = async () => {
    const { error } = await supabase
      .from('call_sessions')
      .update({ is_muted: !isMuted })
      .eq('id', callId);

    if (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const toggleVideo = () => {
    const localStream = webRTCService.localStream;
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoEnabled;
      setVideoEnabled(!videoEnabled);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleMute}
        className={isMuted ? "bg-destructive text-destructive-foreground" : ""}
      >
        {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleVideo}
        className={!videoEnabled ? "bg-destructive text-destructive-foreground" : ""}
      >
        {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
      </Button>
    </div>
  );
};