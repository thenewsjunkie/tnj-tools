import { useCallback, useRef } from 'react';
import { useWebRTCChannel } from './useWebRTCChannel';

export const useWebRTCSignaling = (
  roomId: string,
  peerConnection: RTCPeerConnection | null,
  isHost: boolean
) => {
  const hasRemoteDescRef = useRef<boolean>(false);
  const pendingCandidatesRef = useRef<RTCIceCandidate[]>([]);

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidate) => {
    if (!hasRemoteDescRef.current) {
      console.log('[useWebRTCSignaling] Queueing ICE candidate:', {
        type: candidate.type,
        protocol: candidate.protocol,
        address: candidate.address
      });
      pendingCandidatesRef.current.push(candidate);
      return;
    }

    try {
      if (peerConnection?.remoteDescription) {
        console.log('[useWebRTCSignaling] Adding ICE candidate');
        await peerConnection.addIceCandidate(candidate);
        console.log('[useWebRTCSignaling] ICE candidate added successfully');
      }
    } catch (error) {
      console.error('[useWebRTCSignaling] Error adding ICE candidate:', error);
    }
  }, [peerConnection]);

  const { sendOffer, sendAnswer, sendIceCandidate } = useWebRTCChannel(
    roomId,
    async (offer) => {
      if (!isHost && peerConnection) {
        try {
          console.log('[useWebRTCSignaling] Viewer received offer');
          await peerConnection.setRemoteDescription(offer);
          hasRemoteDescRef.current = true;
          
          console.log('[useWebRTCSignaling] Creating answer');
          const answer = await peerConnection.createAnswer();
          console.log('[useWebRTCSignaling] Setting local description');
          await peerConnection.setLocalDescription(answer);
          console.log('[useWebRTCSignaling] Sending answer');
          sendAnswer(answer);

          // Process pending candidates
          console.log('[useWebRTCSignaling] Processing pending candidates:', pendingCandidatesRef.current.length);
          for (const candidate of pendingCandidatesRef.current) {
            await handleIceCandidate(candidate);
          }
          pendingCandidatesRef.current = [];
        } catch (error) {
          console.error('[useWebRTCSignaling] Error handling offer:', error);
        }
      }
    },
    async (answer) => {
      if (isHost && peerConnection) {
        try {
          console.log('[useWebRTCSignaling] Host received answer');
          await peerConnection.setRemoteDescription(answer);
          hasRemoteDescRef.current = true;

          // Process pending candidates
          console.log('[useWebRTCSignaling] Processing pending candidates:', pendingCandidatesRef.current.length);
          for (const candidate of pendingCandidatesRef.current) {
            await handleIceCandidate(candidate);
          }
          pendingCandidatesRef.current = [];
        } catch (error) {
          console.error('[useWebRTCSignaling] Error handling answer:', error);
        }
      }
    },
    handleIceCandidate
  );

  return { sendOffer, sendAnswer, sendIceCandidate };
};