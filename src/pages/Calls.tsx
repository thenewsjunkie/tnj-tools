import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Maximize2, Mic, MicOff, X } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface CallSession {
  id: string;
  caller_name: string;
  topic: string | null;
  status: "waiting" | "connected" | "ended";
  is_muted: boolean;
  started_at: string;
  connection_quality?: string;
}

const Calls = () => {
  const [calls, setCalls] = useState<CallSession[]>([]);
  const [fullscreenCall, setFullscreenCall] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to call_sessions changes
    const channel = supabase
      .channel('call_sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'call_sessions'
        },
        (payload) => {
          // Refresh calls when there's a change
          fetchCalls();
        }
      )
      .subscribe();

    fetchCalls();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCalls = async () => {
    const { data, error } = await supabase
      .from('call_sessions')
      .select('*')
      .in('status', ['waiting', 'connected'])
      .order('created_at', { ascending: true })
      .limit(3);

    if (error) {
      toast({
        title: "Error fetching calls",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setCalls(data);
  };

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

  const muteAll = async () => {
    const { error } = await supabase
      .from('call_sessions')
      .update({ is_muted: true })
      .in('id', calls.map(c => c.id));

    if (error) {
      toast({
        title: "Error muting all calls",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const unmuteAll = async () => {
    const { error } = await supabase
      .from('call_sessions')
      .update({ is_muted: false })
      .in('id', calls.map(c => c.id));

    if (error) {
      toast({
        title: "Error unmuting all calls",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const endAllCalls = async () => {
    const { error } = await supabase
      .from('call_sessions')
      .update({ 
        status: 'ended',
        ended_at: new Date().toISOString()
      })
      .in('id', calls.map(c => c.id));

    if (error) {
      toast({
        title: "Error ending all calls",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Live Callers</h1>
          <div className="flex gap-2">
            <Button onClick={muteAll} variant="outline">Mute All</Button>
            <Button onClick={unmuteAll} variant="outline">Unmute All</Button>
            <Button onClick={endAllCalls} variant="destructive">End All Calls</Button>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default Calls;