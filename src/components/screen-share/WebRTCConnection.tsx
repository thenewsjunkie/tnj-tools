import { useEffect, useRef, useCallback } from "react";
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
  const iceCandidatesQueueRef = useRef<RTCIceCandidate[]>([]);

  const handleIceCandidate = useCallback((candidate: RTCIceCandidate) => {
    if (peerConnectionRef.current?.remoteDescription) {
      console.log('[WebRTCConnection] Adding ICE candidate immediately:', candidate);
      peerConnectionRef.current.addIceCandidate(candidate).catch(error => {
        console.error('[WebRTCConnection] Error adding ICE candidate:', error);
      });
    } else {
      console.log('[WebRTCConnection] Queueing ICE candidate:', candidate);
      iceCandidatesQueueRef.current.push(candidate);
    }
  }, []);

  const { sendOffer, sendAnswer, sendIceCandidate } = useWebRTCSignaling(roomId, isHost, {
    onOffer: async (offer) => {
      if (!isHost && peerConnectionRef.current) {
        try {
          console.log('[WebRTCConnection] Viewer received offer, setting remote description');
          await peerConnectionRef.current.setRemoteDescription(offer);
          
          console.log('[WebRTCConnection] Creating answer');
          const answer = await peerConnectionRef.current.createAnswer();
          console.log('[WebRTCConnection] Setting local description');
          await peerConnectionRef.current.setLocalDescription(answer);
          console.log('[WebRTCConnection] Sending answer');
          sendAnswer(answer);

          // Process queued ICE candidates
          while (iceCandidatesQueueRef.current.length > 0) {
            const candidate = iceCandidatesQueueRef.current.shift();
            if (candidate) {
              console.log('[WebRTCConnection] Processing queued ICE candidate:', candidate);
              await peerConnectionRef.current.addIceCandidate(candidate);
            }
          }
        } catch (error) {
          console.error('[WebRTCConnection] Error handling offer:', error);
        }
      }
    },
    onAnswer: async (answer) => {
      if (isHost && peerConnectionRef.current) {
        try {
          console.log('[WebRTCConnection] Host received answer, setting remote description');
          await peerConnectionRef.current.setRemoteDescription(answer);

          // Process queued ICE candidates
          while (iceCandidatesQueueRef.current.length > 0) {
            const candidate = iceCandidatesQueueRef.current.shift();
            if (candidate) {
              console.log('[WebRTCConnection] Processing queued ICE candidate:', candidate);
              await peerConnectionRef.current.addIceCandidate(candidate);
            }
          }
        } catch (error) {
          console.error('[WebRTCConnection] Error handling answer:', error);
        }
      }
    },
    onIceCandidate: handleIceCandidate
  });

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
      onConnectionEstablished
    );

    peerConnectionRef.current = peerConnection;
    remoteStreamRef.current = remoteStream;

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

    peerConnection.onsignalingstatechange = () => {
      console.log('[WebRTCConnection] Signaling state:', peerConnection.signalingState);
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log('[WebRTCConnection] ICE connection state:', peerConnection.iceConnectionState);
    };

    if (isHost && streamRef.current) {
      console.log('[WebRTCConnection] Host adding initial stream tracks');
      addTracksToConnection(peerConnection, streamRef.current);
      
      peerConnection.createOffer()
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