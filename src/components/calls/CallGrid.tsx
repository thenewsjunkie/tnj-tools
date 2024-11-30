import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Maximize2, Mic, MicOff, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface CallGridProps {
  calls: CallSession[];
  fullscreenCall: string | null;
  setFullscreenCall: (id: string | null) => void;
}

export const CallGrid = ({ calls, fullscreenCall, setFullscreenCall }: CallGridProps) => {
  const { toast } = useToast();

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
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
              <p className="text-white">Video Feed</p>
            </div>
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

          <div className="p-4">
            <h3 className="font-semibold">{call.caller_name}</h3>
            {call.topic && (
              <p className="text-sm text-muted-foreground">{call.topic}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};