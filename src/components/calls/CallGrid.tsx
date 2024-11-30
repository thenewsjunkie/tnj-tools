import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Maximize2, Mic, MicOff, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useRef } from "react";
import type { CallSession } from "@/types/calls";

interface CallGridProps {
  calls: CallSession[];
  fullscreenCall: string | null;
  setFullscreenCall: (id: string | null) => void;
}

export const CallGrid = ({ calls, fullscreenCall, setFullscreenCall }: CallGridProps) => {
  const { toast } = useToast();
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    // Set up video connections for each call
    calls.forEach(async (call) => {
      if (!videoRefs.current[call.id]) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        if (videoRefs.current[call.id]) {
          videoRefs.current[call.id]!.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
      }
    });

    // Cleanup function
    return () => {
      Object.values(videoRefs.current).forEach(videoRef => {
        if (videoRef && videoRef.srcObject) {
          const stream = videoRef.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      });
    };
  }, [calls]);

  const toggleMute = async (callId: string) => {
    const call = calls.find(c => c.id === callId);
    if (!call) return;

    const { error } = await supabase
      .from('call_sessions')
      .update({ is_muted: !call.is_muted })
      .eq('id', callId);

    if (error) {
      toast({
        title: "Error toggling mute",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const endCall = async (callId: string) => {
    const { error } = await supabase
      .from('call_sessions')
      .update({ 
        status: 'ended',
        ended_at: new Date().toISOString()
      })
      .eq('id', callId);

    if (error) {
      toast({
        title: "Error ending call",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {calls.map((call) => (
        <div
          key={call.id}
          className={`relative bg-card rounded-lg overflow-hidden border ${
            fullscreenCall === call.id ? 'fixed inset-0 z-50' : ''
          }`}
        >
          <AspectRatio ratio={16 / 9}>
            <video
              ref={el => videoRefs.current[call.id] = el}
              autoPlay
              playsInline
              muted={call.is_muted}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AspectRatio>

          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="bg-black/50 hover:bg-black/70"
              onClick={() => toggleMute(call.id)}
            >
              {call.is_muted ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="bg-black/50 hover:bg-black/70"
              onClick={() => setFullscreenCall(
                fullscreenCall === call.id ? null : call.id
              )}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="bg-black/50 hover:bg-black/70"
              onClick={() => endCall(call.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="font-semibold text-white">{call.caller_name}</h3>
            {call.topic && (
              <p className="text-sm text-white/80">{call.topic}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};