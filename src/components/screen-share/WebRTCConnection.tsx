import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WebRTCConnectionProps {
  roomId: string;
  isHost: boolean;
  onTrackAdded: (stream: MediaStream) => void;
  onConnectionEstablished: () => void;
}

const WebRTCConnection = ({
  roomId,
  isHost,
  onTrackAdded,
  onConnectionEstablished,
}: WebRTCConnectionProps) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const initializeConnection = async () => {
      const configuration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      };
      
      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Use a unique channel name for each room
      const channelName = `room:${roomId}`;
      channelRef.current = supabase.channel(channelName);

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          channelRef.current.send({
            type: "broadcast",
            event: "ice-candidate",
            payload: event.candidate,
          });
        }
      };

      peerConnectionRef.current.ontrack = (event) => {
        onTrackAdded(event.streams[0]);
      };

      channelRef.current
        .on("broadcast", { event: "offer" }, async ({ payload }: any) => {
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
        .on("broadcast", { event: "answer" }, async ({ payload }: any) => {
          if (isHost && peerConnectionRef.current) {
            await peerConnectionRef.current.setRemoteDescription(payload);
            onConnectionEstablished();
          }
        })
        .on("broadcast", { event: "ice-candidate" }, ({ payload }: any) => {
          if (peerConnectionRef.current) {
            peerConnectionRef.current.addIceCandidate(payload);
          }
        })
        .subscribe();
    };

    initializeConnection();

    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [roomId, isHost, onTrackAdded, onConnectionEstablished]);

  return null;
};

export default WebRTCConnection;