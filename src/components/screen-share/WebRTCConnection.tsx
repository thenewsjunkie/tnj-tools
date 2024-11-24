import { useEffect, useRef, useCallback } from "react";
import { getRTCConfiguration } from "./utils/webrtcConfig";
import { useWebRTCChannel } from "./hooks/useWebRTCChannel";

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
  const pendingCandidatesRef = useRef<RTCIceCandidate[]>([]);
  const isConnectedRef = useRef<boolean>(false);
  const hasRemoteDescRef = useRef<boolean>(false);

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidate) => {
    if (!hasRemoteDescRef.current) {
      console.log('Queuing ICE candidate as remote description is not set yet');
      pendingCandidatesRef.current.push(candidate);
      return;
    }

    try {
      await peerConnectionRef.current?.addIceCandidate(candidate);
      console.log('Added ICE candidate successfully');
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }, []);

  const { sendOffer, sendAnswer, sendIceCandidate } = useWebRTCChannel(
    roomId,
    async (offer) => {
      if (!isHost && peerConnectionRef.current) {
        console.log('Setting remote description (offer)');
        await peerConnectionRef.current.setRemoteDescription(offer);
        hasRemoteDescRef.current = true;
        
        console.log('Creating answer');
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        sendAnswer(answer);

        // Add any pending candidates
        for (const candidate of pendingCandidatesRef.current) {
          await peerConnectionRef.current.addIceCandidate(candidate);
        }
        pendingCandidatesRef.current = [];
      }
    },
    async (answer) => {
      if (isHost && peerConnectionRef.current) {
        console.log('Setting remote description (answer)');
        await peerConnectionRef.current.setRemoteDescription(answer);
        hasRemoteDescRef.current = true;

        // Add any pending candidates
        for (const candidate of pendingCandidatesRef.current) {
          await peerConnectionRef.current.addIceCandidate(candidate);
        }
        pendingCandidatesRef.current = [];
      }
    },
    handleIceCandidate
  );

  useEffect(() => {
    const initializeConnection = async () => {
      console.log('Initializing WebRTC connection as:', isHost ? 'host' : 'viewer');
      
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }

      const configuration = getRTCConfiguration();
      peerConnectionRef.current = new RTCPeerConnection(configuration);
      
      if (isHost && stream) {
        console.log('Host adding stream tracks');
        stream.getTracks().forEach(track => {
          if (peerConnectionRef.current) {
            peerConnectionRef.current.addTrack(track, stream);
          }
        });
      }

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          sendIceCandidate(event.candidate);
        }
      };

      peerConnectionRef.current.oniceconnectionstatechange = () => {
        const state = peerConnectionRef.current?.iceConnectionState;
        console.log('ICE connection state changed:', state);
        
        if (state === 'connected' || state === 'completed') {
          if (!isConnectedRef.current) {
            isConnectedRef.current = true;
            onConnectionEstablished();
          }
        }
      };

      peerConnectionRef.current.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        if (event.streams && event.streams[0]) {
          onTrackAdded(event.streams[0]);
        }
      };

      if (isHost) {
        try {
          console.log('Host creating offer');
          const offer = await peerConnectionRef.current.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await peerConnectionRef.current.setLocalDescription(offer);
          sendOffer(offer);
        } catch (error) {
          console.error("Error creating offer:", error);
        }
      }
    };

    initializeConnection();

    return () => {
      console.log('Cleaning up WebRTC connection');
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      isConnectedRef.current = false;
      hasRemoteDescRef.current = false;
      pendingCandidatesRef.current = [];
    };
  }, [roomId, isHost, stream, onTrackAdded, onConnectionEstablished, sendOffer, sendIceCandidate]);

  return null;
};

export default WebRTCConnection;