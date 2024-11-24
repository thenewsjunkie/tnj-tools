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
      console.log('[WebRTCConnection] Stream updated:', {
        hasStream: !!stream,
        tracks: stream?.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, muted: t.muted }))
      });
      
      if (isHost && peerConnectionRef.current && stream) {
        console.log('[WebRTCConnection] Host adding tracks to connection');
        addTracksToConnection(peerConnectionRef.current, stream);
      }
    }
  }, [stream, isHost]);

  // Initialize WebRTC connection
  useEffect(() => {
    console.log('[WebRTCConnection] Initializing as:', isHost ? 'host' : 'viewer');
    
    const { peerConnection, remoteStream } = setupPeerConnection(
      isHost,
      (stream) => {
        console.log('[WebRTCConnection] Track added callback:', {
          streamId: stream.id,
          tracks: stream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, muted: t.muted }))
        });
        onTrackAdded(stream);
      },
      () => {
        console.log('[WebRTCConnection] Connection established');
        onConnectionEstablished();
      }
    );

    peerConnectionRef.current = peerConnection;
    remoteStreamRef.current = remoteStream;

    peerConnection.oniceconnectionstatechange = () => {
      console.log('[WebRTCConnection] ICE connection state:', peerConnection.iceConnectionState);
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('[WebRTCConnection] Connection state:', peerConnection.connectionState);
    };

    peerConnection.onsignalingstatechange = () => {
      console.log('[WebRTCConnection] Signaling state:', peerConnection.signalingState);
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTCConnection] New ICE candidate:', {
          type: event.candidate.type,
          protocol: event.candidate.protocol,
          address: event.candidate.address
        });
        sendIceCandidate(event.candidate);
      }
    };

    // Add initial stream for host
    if (isHost && streamRef.current) {
      console.log('[WebRTCConnection] Host adding initial stream tracks');
      addTracksToConnection(peerConnection, streamRef.current);
      
      // Create and send offer
      peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
      .then(offer => {
        console.log('[WebRTCConnection] Created offer:', offer.type);
        return peerConnection.setLocalDescription(offer)
          .then(() => sendOffer(offer));
      })
      .catch(error => {
        console.error('[WebRTCConnection] Error creating offer:', error);
      });
    }

    return () => {
      console.log('[WebRTCConnection] Cleaning up connection');
      cleanupWebRTC(peerConnectionRef.current, remoteStreamRef.current);
      peerConnectionRef.current = null;
      remoteStreamRef.current = null;
    };
  }, [roomId, isHost, onTrackAdded, onConnectionEstablished, sendOffer, sendIceCandidate]);

  return null;
};

export default WebRTCConnection;