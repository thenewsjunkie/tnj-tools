import { useCallback } from 'react';
import { useWebRTCChannel } from './useWebRTCChannel';

interface SignalingCallbacks {
  onOffer: (offer: RTCSessionDescription) => void;
  onAnswer: (answer: RTCSessionDescription) => void;
  onIceCandidate: (candidate: RTCIceCandidate) => void;
}

export const useWebRTCSignaling = (
  roomId: string,
  isHost: boolean,
  callbacks: SignalingCallbacks
) => {
  const { sendOffer, sendAnswer, sendIceCandidate } = useWebRTCChannel(
    roomId,
    callbacks.onOffer,
    callbacks.onAnswer,
    callbacks.onIceCandidate
  );

  return { sendOffer, sendAnswer, sendIceCandidate };
};