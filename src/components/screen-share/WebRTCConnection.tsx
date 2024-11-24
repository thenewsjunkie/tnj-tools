import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WebRTCConnectionProps {
  roomId: string;
  isHost: boolean;
  stream?: MediaStream | null;
  onTrackAdded: (stream: MediaStream) => void;
  onConnectionEstablished: () => void;
}

const WebRTCConnection = ({
  roomId,
  isHost,
  stream,
  onTrackAdded,
  onConnectionEstablished,
}: WebRTCConnectionProps) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const initializeConnection = async () => {
      const configuration = {
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
          {
            urls: "stun:stun1.l.google.com:19302",
          },
        ],
      };
      
      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Add stream tracks to peer connection if host
      if (isHost && stream) {
        stream.getTracks().forEach(track => {
          peerConnectionRef.current?.addTrack(track, stream);
        });
      }

      const channelName = `room:${roomId}`;
      channelRef.current = supabase.channel(channelName, {
        config: {
          broadcast: { self: true },
        },
      });

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

      // If host, create and send offer
      if (isHost) {
        try {
          const offer = await peerConnectionRef.current.createOffer();
          await peerConnectionRef.current.setLocalDescription(offer);
          channelRef.current.send({
            type: "broadcast",
            event: "offer",
            payload: offer,
          });
        } catch (error) {
          console.error("Error creating offer:", error);
        }
      }

      channelRef.current
        .on("broadcast", { event: "offer" }, async ({ payload }: any) => {
          if (!isHost && peerConnectionRef.current) {
            try {
              await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(payload)
              );
              const answer = await peerConnectionRef.current.createAnswer();
              await peerConnectionRef.current.setLocalDescription(answer);
              channelRef.current.send({
                type: "broadcast",
                event: "answer",
                payload: answer,
              });
            } catch (error) {
              console.error("Error handling offer:", error);
            }
          }
        })
        .on("broadcast", { event: "answer" }, async ({ payload }: any) => {
          if (isHost && peerConnectionRef.current) {
            try {
              await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(payload)
              );
              onConnectionEstablished();
            } catch (error) {
              console.error("Error handling answer:", error);
            }
          }
        })
        .on("broadcast", { event: "ice-candidate" }, async ({ payload }: any) => {
          if (peerConnectionRef.current) {
            try {
              await peerConnectionRef.current.addIceCandidate(
                new RTCIceCandidate(payload)
              );
            } catch (error) {
              console.error("Error adding ICE candidate:", error);
            }
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
  }, [roomId, isHost, stream, onTrackAdded, onConnectionEstablished]);

  return null;
};

export default WebRTCConnection;