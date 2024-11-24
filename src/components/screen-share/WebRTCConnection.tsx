import { useEffect, useRef } from "react";
import { setupPeerConnection, addTracksToConnection, cleanupWebRTC } from "./utils/webrtcHelpers";
import { useWebRTCSignaling } from "./hooks/useWebRTCSignaling";

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
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { sendOffer, sendIceCandidate } = useWebRTCSignaling(
    roomId,
    peerConnectionRef.current,
    isHost
  );

  // Update stream reference when stream prop changes
  useEffect(() => {
    if (stream !== streamRef.current) {
      streamRef.current = stream || null;
      console.log('Stream updated:', stream ? 'Stream present' : 'No stream');
      
      if (isHost && peerConnectionRef.current && stream) {
        addTracksToConnection(peerConnectionRef.current, stream);
      }
    }
  }, [stream, isHost]);

  // Initialize WebRTC connection
  useEffect(() => {
    console.log('Initializing WebRTC connection as:', isHost ? 'host' : 'viewer');
    
    const { peerConnection, remoteStream } = setupPeerConnection(
      isHost,
      onTrackAdded,
      onConnectionEstablished
    );

    peerConnectionRef.current = peerConnection;
    remoteStreamRef.current = remoteStream;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('New ICE candidate:', event.candidate);
        sendIceCandidate(event.candidate);
      }
    };

    // Add initial stream for host
    if (isHost && streamRef.current) {
      console.log('Host adding initial stream tracks');
      addTracksToConnection(peerConnection, streamRef.current);
      
      // Create and send offer
      peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
      .then(offer => {
        return peerConnection.setLocalDescription(offer)
          .then(() => sendOffer(offer));
      })
      .catch(error => {
        console.error('Error creating offer:', error);
      });
    }

    return () => {
      console.log('Cleaning up WebRTC connection');
      cleanupWebRTC(peerConnectionRef.current, remoteStreamRef.current);
      peerConnectionRef.current = null;
      remoteStreamRef.current = null;
    };
  }, [roomId, isHost, onTrackAdded, onConnectionEstablished, sendOffer, sendIceCandidate]);

  return null;
};

export default WebRTCConnection;