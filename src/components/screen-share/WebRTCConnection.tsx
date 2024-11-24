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
  const streamRef = useRef<MediaStream | null>(null);

  // Update streamRef when stream changes
  useEffect(() => {
    streamRef.current = stream || null;
  }, [stream]);

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
        try {
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
        } catch (error) {
          console.error('Error handling offer:', error);
        }
      }
    },
    async (answer) => {
      if (isHost && peerConnectionRef.current) {
        try {
          console.log('Setting remote description (answer)');
          await peerConnectionRef.current.setRemoteDescription(answer);
          hasRemoteDescRef.current = true;

          // Add any pending candidates
          for (const candidate of pendingCandidatesRef.current) {
            await peerConnectionRef.current.addIceCandidate(candidate);
          }
          pendingCandidatesRef.current = [];
        } catch (error) {
          console.error('Error handling answer:', error);
        }
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
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Add stream tracks for host
      if (isHost && streamRef.current) {
        console.log('Host adding stream tracks');
        streamRef.current.getTracks().forEach(track => {
          if (peerConnection && streamRef.current) {
            console.log('Adding track:', track.kind);
            peerConnection.addTrack(track, streamRef.current);
          }
        });
      }

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('New ICE candidate:', event.candidate.type);
          sendIceCandidate(event.candidate);
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        const state = peerConnection.iceConnectionState;
        console.log('ICE connection state changed:', state);
        
        if (state === 'connected' || state === 'completed') {
          if (!isConnectedRef.current) {
            isConnectedRef.current = true;
            onConnectionEstablished();
          }
        }
      };

      peerConnection.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        if (event.streams && event.streams[0]) {
          onTrackAdded(event.streams[0]);
        }
      };

      if (isHost) {
        try {
          console.log('Host creating offer');
          const offer = await peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await peerConnection.setLocalDescription(offer);
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
  }, [roomId, isHost, onTrackAdded, onConnectionEstablished, sendOffer, sendIceCandidate]);

  return null;
};

export default WebRTCConnection;