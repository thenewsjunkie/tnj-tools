import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import VideoDisplay from "@/components/screen-share/VideoDisplay";
import WebRTCConnection from "@/components/screen-share/WebRTCConnection";

const ScreenShare = () => {
  const { code } = useParams();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkCode = async () => {
      if (!code) {
        setIsValid(false);
        return;
      }

      const { data, error } = await supabase
        .from("screen_share_sessions")
        .select()
        .eq("share_code", code)
        .eq("is_active", true)
        .gte("expires_at", new Date().toISOString())
        .single();

      if (error || !data) {
        console.error("Error checking share code:", error);
        setIsValid(false);
        return;
      }

      setIsValid(true);
      // If host isn't connected yet, this user becomes the host
      setIsHost(!data.host_connected);
      setRoomId(data.id);

      // Update connection status
      const column = !data.host_connected ? "host_connected" : "viewer_connected";
      await supabase
        .from("screen_share_sessions")
        .update({ [column]: true })
        .eq("id", data.id);
    };

    checkCode();
  }, [code]);

  const handleTrackAdded = (stream: MediaStream) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      toast({
        title: "Screen sharing started",
        description: "Your screen is now being shared",
      });
    } catch (error) {
      console.error("Error starting screen share:", error);
      toast({
        title: "Error",
        description: "Failed to start screen sharing",
        variant: "destructive",
      });
    }
  };

  const stopScreenShare = async () => {
    if (localVideoRef.current?.srcObject) {
      (localVideoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }
    if (code && roomId) {
      await supabase
        .from("screen_share_sessions")
        .update({ 
          is_active: false,
          host_connected: false,
          viewer_connected: false 
        })
        .eq("id", roomId);
    }
    window.close();
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (code && roomId) {
        const column = isHost ? "host_connected" : "viewer_connected";
        supabase
          .from("screen_share_sessions")
          .update({ [column]: false })
          .eq("id", roomId);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [code, roomId, isHost]);

  if (isValid === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Invalid or expired share code</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-white text-xl">Screen Share: {code}</h1>
            <Button
              variant="secondary"
              onClick={stopScreenShare}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Stop Sharing
            </Button>
          </div>
          
          {roomId && (
            <WebRTCConnection
              roomId={roomId}
              isHost={isHost}
              onTrackAdded={handleTrackAdded}
              onConnectionEstablished={isHost ? startScreenShare : () => {}}
            />
          )}
          
          <VideoDisplay
            isHost={isHost}
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
          />
        </div>
      </div>
    </div>
  );
};

export default ScreenShare;