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
      console.log('Queueing ICE candidate:', candidate);
      pendingCandidatesRef.current.push(candidate);
      return;
    }

    try {
      if (peerConnection?.remoteDescription) {
        await peerConnection.addIceCandidate(candidate);
        console.log('Added ICE candidate:', candidate);
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }, [peerConnection]);

  const { sendOffer, sendAnswer, sendIceCandidate } = useWebRTCChannel(
    roomId,
    async (offer) => {
      if (!isHost && peerConnection) {
        try {
          console.log('Viewer received offer:', offer);
          await peerConnection.setRemoteDescription(offer);
          hasRemoteDescRef.current = true;
          
          console.log('Creating answer');
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          sendAnswer(answer);

          // Process pending candidates
          for (const candidate of pendingCandidatesRef.current) {
            await handleIceCandidate(candidate);
          }
          pendingCandidatesRef.current = [];
        } catch (error) {
          console.error('Error handling offer:', error);
        }
      }
    },
    async (answer) => {
      if (isHost && peerConnection) {
        try {
          console.log('Host received answer:', answer);
          await peerConnection.setRemoteDescription(answer);
          hasRemoteDescRef.current = true;

          // Process pending candidates
          for (const candidate of pendingCandidatesRef.current) {
            await handleIceCandidate(candidate);
          }
          pendingCandidatesRef.current = [];
        } catch (error) {
          console.error('Error handling answer:', error);
        }
      }
    },
    handleIceCandidate
  );

  return { sendOffer, sendAnswer, sendIceCandidate };
};