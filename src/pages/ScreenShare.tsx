import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const ScreenShare = () => {
  const { code } = useParams();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);
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
        .single();

      if (error || !data) {
        console.error("Error checking share code:", error);
        setIsValid(false);
        return;
      }

      const isValidSession = data && new Date(data.expires_at) > new Date();
      setIsValid(isValidSession);

      if (!isValidSession) {
        await supabase
          .from("screen_share_sessions")
          .update({ is_active: false })
          .eq("id", data.id);
        return;
      }

      // If no one is connected yet, this user becomes the host
      setIsHost(!data.host_connected);
      initializeConnection(data.room_id);
    };

    checkCode();
  }, [code]);

  const initializeConnection = async (roomId: string) => {
    // Initialize WebRTC peer connection
    const configuration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
    peerConnectionRef.current = new RTCPeerConnection(configuration);

    // Set up Supabase realtime channel for signaling
    channelRef.current = supabase.channel(`room:${roomId}`);

    // Handle ICE candidates
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        channelRef.current.send({
          type: "broadcast",
          event: "ice-candidate",
          payload: event.candidate,
        });
      }
    };

    // Handle incoming tracks (for viewer)
    peerConnectionRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Subscribe to channel events
    channelRef.current
      .on("broadcast", { event: "offer" }, async ({ payload }) => {
        if (!isHost && peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(payload);
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          channelRef.current.send({
            type: "broadcast",
            event: "answer",
            payload: answer,
          });
        }
      })
      .on("broadcast", { event: "answer" }, async ({ payload }) => {
        if (isHost && peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(payload);
        }
      })
      .on("broadcast", { event: "ice-candidate" }, ({ payload }) => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addIceCandidate(payload);
        }
      })
      .subscribe();

    // Update connection status in database
    const column = isHost ? "host_connected" : "viewer_connected";
    await supabase
      .from("screen_share_sessions")
      .update({ [column]: true })
      .eq("share_code", code);

    setIsConnected(true);

    // If host, start screen sharing
    if (isHost) {
      startScreenShare();
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        if (peerConnectionRef.current) {
          peerConnectionRef.current.addTrack(track, stream);
        }
      });

      // Create and send offer
      if (peerConnectionRef.current) {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        channelRef.current.send({
          type: "broadcast",
          event: "offer",
          payload: offer,
        });
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

  const stopScreenShare = () => {
    if (localVideoRef.current?.srcObject) {
      (localVideoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    channelRef.current?.unsubscribe();
  };

  useEffect(() => {
    return () => {
      stopScreenShare();
      // Update connection status in database
      if (code) {
        const column = isHost ? "host_connected" : "viewer_connected";
        supabase
          .from("screen_share_sessions")
          .update({ [column]: false })
          .eq("share_code", code);
      }
    };
  }, [code, isHost]);

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
            {isHost && (
              <Button
                variant="secondary"
                onClick={stopScreenShare}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Stop Sharing
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {isHost && (
              <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-sm text-white">
                  Your Screen
                </div>
              </div>
            )}
            
            <div className="relative aspect-video bg-black/50 rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded text-sm text-white">
                {isHost ? "Viewer's View" : "Shared Screen"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenShare;