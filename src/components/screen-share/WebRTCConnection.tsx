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

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidate) => {
    if (!hasRemoteDescRef.current) {
      console.log('Queueing ICE candidate:', candidate);
      pendingCandidatesRef.current.push(candidate);
      return;
    }

    try {
      await peerConnectionRef.current?.addIceCandidate(candidate);
      console.log('Added ICE candidate:', candidate);
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }, []);

  const { sendOffer, sendAnswer, sendIceCandidate } = useWebRTCChannel(
    roomId,
    async (offer) => {
      if (!isHost && peerConnectionRef.current) {
        try {
          console.log('Viewer received offer:', offer);
          await peerConnectionRef.current.setRemoteDescription(offer);
          hasRemoteDescRef.current = true;
          
          console.log('Creating answer');
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          sendAnswer(answer);

          // Process any pending ICE candidates
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
          console.log('Host received answer:', answer);
          await peerConnectionRef.current.setRemoteDescription(answer);
          hasRemoteDescRef.current = true;

          // Process any pending ICE candidates
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

  // Update stream reference when stream prop changes
  useEffect(() => {
    streamRef.current = stream || null;
    console.log('Stream updated:', stream ? 'Stream present' : 'No stream');
  }, [stream]);

  useEffect(() => {
    const initializeConnection = async () => {
      console.log('Initializing WebRTC connection as:', isHost ? 'host' : 'viewer');
      
      if (peerConnectionRef.current) {
        console.log('Closing existing peer connection');
        peerConnectionRef.current.close();
      }

      const peerConnection = new RTCPeerConnection(getRTCConfiguration());
      peerConnectionRef.current = peerConnection;

      // Add stream tracks for host
      if (isHost && streamRef.current) {
        console.log('Host adding stream tracks');
        const tracks = streamRef.current.getTracks();
        console.log('Number of tracks to add:', tracks.length);
        
        tracks.forEach(track => {
          if (streamRef.current) {
            console.log('Adding track:', track.kind, track.enabled, track.readyState);
            peerConnection.addTrack(track, streamRef.current);
          }
        });
      }

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('New ICE candidate:', event.candidate);
          sendIceCandidate(event.candidate);
        }
      };

      peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peerConnection.iceConnectionState);
        if (peerConnection.iceConnectionState === 'connected' || 
            peerConnection.iceConnectionState === 'completed') {
          if (!isConnectedRef.current) {
            console.log('Connection established');
            isConnectedRef.current = true;
            onConnectionEstablished();
          }
        }
      };

      peerConnection.ontrack = (event) => {
        console.log('Received remote track:', event.track.kind);
        if (event.streams && event.streams[0]) {
          console.log('Setting remote stream');
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
          console.error('Error creating offer:', error);
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