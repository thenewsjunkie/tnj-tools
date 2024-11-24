import { useEffect, useRef, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useWebRTCChannel = (
  roomId: string,
  onOffer: (offer: RTCSessionDescription) => void,
  onAnswer: (answer: RTCSessionDescription) => void,
  onIceCandidate: (candidate: RTCIceCandidate) => void,
) => {
  const channelRef = useRef<any>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidate[]>([]);

  const sendMessage = useCallback((event: string, payload: any) => {
    console.log(`[useWebRTCChannel] Sending ${event}:`, payload);
    channelRef.current?.send({
      type: "broadcast",
      event: event,
      payload: payload,
    });
  }, []);

  const sendOffer = useCallback((offer: RTCSessionDescriptionInit) => {
    console.log('[useWebRTCChannel] Sending offer:', offer);
    sendMessage("offer", offer);
  }, [sendMessage]);

  const sendAnswer = useCallback((answer: RTCSessionDescriptionInit) => {
    console.log('[useWebRTCChannel] Sending answer:', answer);
    sendMessage("answer", answer);
  }, [sendMessage]);

  const sendIceCandidate = useCallback((candidate: RTCIceCandidate) => {
    console.log('[useWebRTCChannel] Sending ICE candidate:', candidate);
    sendMessage("ice-candidate", candidate);
  }, [sendMessage]);

  useEffect(() => {
    const channelName = `webrtc:${roomId}`;
    console.log('[useWebRTCChannel] Creating channel:', channelName);
    
    channelRef.current = supabase.channel(channelName)
      .on("broadcast", { event: "offer" }, ({ payload }) => {
        console.log('[useWebRTCChannel] Received offer:', payload);
        onOffer(new RTCSessionDescription(payload));
      })
      .on("broadcast", { event: "answer" }, ({ payload }) => {
        console.log('[useWebRTCChannel] Received answer:', payload);
        onAnswer(new RTCSessionDescription(payload));
      })
      .on("broadcast", { event: "ice-candidate" }, ({ payload }) => {
        console.log('[useWebRTCChannel] Received ICE candidate:', payload);
        onIceCandidate(new RTCIceCandidate(payload));
      })
      .subscribe((status: string) => {
        console.log('[useWebRTCChannel] Channel subscription status:', status);
      });

    return () => {
      console.log('[useWebRTCChannel] Unsubscribing from channel');
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [roomId, onOffer, onAnswer, onIceCandidate]);

  return { sendOffer, sendAnswer, sendIceCandidate };
};