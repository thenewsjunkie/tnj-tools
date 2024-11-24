import { useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useWebRTCChannel = (
  roomId: string,
  onOffer: (offer: RTCSessionDescription) => void,
  onAnswer: (answer: RTCSessionDescription) => void,
  onIceCandidate: (candidate: RTCIceCandidate) => void,
) => {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const channelName = `webrtc:${roomId}`;
    console.log('Creating channel:', channelName);
    
    channelRef.current = supabase.channel(channelName)
      .on("broadcast", { event: "offer" }, async ({ payload }: any) => {
        console.log('Received offer:', payload);
        onOffer(new RTCSessionDescription(payload));
      })
      .on("broadcast", { event: "answer" }, async ({ payload }: any) => {
        console.log('Received answer:', payload);
        onAnswer(new RTCSessionDescription(payload));
      })
      .on("broadcast", { event: "ice-candidate" }, async ({ payload }: any) => {
        console.log('Received ICE candidate:', payload);
        onIceCandidate(new RTCIceCandidate(payload));
      })
      .subscribe((status: string) => {
        console.log('Channel subscription status:', status);
      });

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [roomId, onOffer, onAnswer, onIceCandidate]);

  const sendOffer = (offer: RTCSessionDescriptionInit) => {
    console.log('Sending offer:', offer);
    channelRef.current?.send({
      type: "broadcast",
      event: "offer",
      payload: offer,
    });
  };

  const sendAnswer = (answer: RTCSessionDescriptionInit) => {
    console.log('Sending answer:', answer);
    channelRef.current?.send({
      type: "broadcast",
      event: "answer",
      payload: answer,
    });
  };

  const sendIceCandidate = (candidate: RTCIceCandidate) => {
    console.log('Sending ICE candidate:', candidate);
    channelRef.current?.send({
      type: "broadcast",
      event: "ice-candidate",
      payload: candidate,
    });
  };

  return { sendOffer, sendAnswer, sendIceCandidate };
};