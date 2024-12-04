import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PhoneIncoming, ArrowLeft } from "lucide-react";
import { CallGrid } from "@/components/calls/CallGrid";
import { CallControls } from "@/components/calls/CallControls";
import type { CallSession } from "@/types/calls";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const Calls = () => {
  const [fullscreenCall, setFullscreenCall] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: calls = [] } = useQuery({
    queryKey: ['calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('call_sessions')
        .select('*')
        .in('status', ['waiting', 'connected'])
        .order('created_at', { ascending: true });

      if (error) {
        toast({
          title: "Error fetching calls",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data;
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('call_sessions_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'call_sessions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['calls'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Get the active call for controls
  const activeCall = calls.find(call => call.status === 'connected');

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link 
              to="/admin" 
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Admin</span>
            </Link>
            <h1 className="text-2xl font-bold">Live Callers</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/connect" 
              className="flex items-center gap-2 text-primary hover:text-primary/80"
            >
              <PhoneIncoming className="h-5 w-5" />
              <span>Callers</span>
            </Link>
          </div>
        </div>

        <CallGrid 
          calls={calls} 
          fullscreenCall={fullscreenCall}
          onFullscreenChange={setFullscreenCall}
        />

        {activeCall && (
          <CallControls 
            callId={activeCall.id} 
            isMuted={activeCall.is_muted} 
          />
        )}
      </div>
    </div>
  );
};

export default Calls;