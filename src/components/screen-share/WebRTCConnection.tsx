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
  const isConnectedRef = useRef<boolean>(false);

  useEffect(() => {
    const initializeConnection = async () => {
      console.log('Initializing WebRTC connection as:', isHost ? 'host' : 'viewer');
      
      // Create peer connection with more STUN servers
      const configuration = {
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
              "stun:stun3.l.google.com:19302",
              "stun:stun4.l.google.com:19302",
            ],
          },
          {
            urls: ['turn:numb.viagenie.ca'],
            username: 'webrtc@live.com',
            credential: 'muazkh'
          }
        ],
        iceCandidatePoolSize: 10,
      };

      // Close any existing connections
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      
      peerConnectionRef.current = new RTCPeerConnection(configuration);
      console.log('Created peer connection with config:', configuration);

      // Add stream tracks to peer connection if host
      if (isHost && stream) {
        console.log('Host adding stream tracks');
        stream.getTracks().forEach(track => {
          if (peerConnectionRef.current) {
            console.log('Adding track:', track.kind);
            peerConnectionRef.current.addTrack(track, stream);
          }
        });
      }

      // Create and configure channel
      const channelName = `webrtc:${roomId}`;
      console.log('Creating channel:', channelName);
      channelRef.current = supabase.channel(channelName);

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('Sending ICE candidate:', event.candidate);
          channelRef.current.send({
            type: "broadcast",
            event: "ice-candidate",
            payload: event.candidate,
          });
        }
      };

      // Monitor ICE connection state
      peerConnectionRef.current.oniceconnectionstatechange = () => {
        const state = peerConnectionRef.current?.iceConnectionState;
        console.log('ICE connection state changed:', state);
        
        if (state === 'connected' || state === 'completed') {
          if (!isConnectedRef.current) {
            console.log('Connection established via ICE state');
            isConnectedRef.current = true;
            onConnectionEstablished();
          }
        }
      };

      // Handle incoming tracks
      peerConnectionRef.current.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        if (event.streams && event.streams[0]) {
          console.log('Setting remote stream');
          onTrackAdded(event.streams[0]);
          if (!isConnectedRef.current) {
            console.log('Connection established via track');
            isConnectedRef.current = true;
            onConnectionEstablished();
          }
        }
      };

      // Monitor connection state
      peerConnectionRef.current.onconnectionstatechange = () => {
        const state = peerConnectionRef.current?.connectionState;
        console.log('Connection state changed:', state);
        
        if (state === 'connected') {
          if (!isConnectedRef.current) {
            console.log('Connection established via connection state');
            isConnectedRef.current = true;
            onConnectionEstablished();
          }
        }
      };

      // If host, create and send offer
      if (isHost) {
        try {
          console.log('Host creating offer');
          const offer = await peerConnectionRef.current.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await peerConnectionRef.current.setLocalDescription(offer);
          console.log('Host sending offer:', offer);
          channelRef.current.send({
            type: "broadcast",
            event: "offer",
            payload: offer,
          });
        } catch (error) {
          console.error("Error creating offer:", error);
        }
      }

      // Handle incoming offers (viewer)
      channelRef.current
        .on("broadcast", { event: "offer" }, async ({ payload }: any) => {
          if (!isHost && peerConnectionRef.current) {
            console.log('Viewer received offer:', payload);
            try {
              await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(payload)
              );
              const answer = await peerConnectionRef.current.createAnswer();
              await peerConnectionRef.current.setLocalDescription(answer);
              console.log('Viewer sending answer:', answer);
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
            console.log('Host received answer:', payload);
            try {
              await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(payload)
              );
            } catch (error) {
              console.error("Error handling answer:", error);
            }
          }
        })
        .on("broadcast", { event: "ice-candidate" }, async ({ payload }: any) => {
          if (peerConnectionRef.current) {
            console.log('Received ICE candidate:', payload);
            try {
              await peerConnectionRef.current.addIceCandidate(
                new RTCIceCandidate(payload)
              );
            } catch (error) {
              console.error("Error adding ICE candidate:", error);
            }
          }
        })
        .subscribe((status: string) => {
          console.log('Channel subscription status:', status);
        });

      console.log(`${isHost ? 'Host' : 'Viewer'} WebRTC connection initialized`);
    };

    initializeConnection();

    return () => {
      console.log('Cleaning up WebRTC connection');
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
      isConnectedRef.current = false;
    };
  }, [roomId, isHost, stream, onTrackAdded, onConnectionEstablished]);

  return null;
};

export default WebRTCConnection;