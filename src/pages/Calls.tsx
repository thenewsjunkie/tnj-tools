import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PhoneIncoming } from "lucide-react";
import { CallGrid } from "@/components/calls/CallGrid";
import { CallControls } from "@/components/calls/CallControls";
import type { CallSession } from "@/types/calls";

const Calls = () => {
  const [calls, setCalls] = useState<CallSession[]>([]);
  const [fullscreenCall, setFullscreenCall] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCalls();

    // Subscribe to call_sessions changes
    const channel = supabase
      .channel('call_sessions_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'call_sessions'
        },
        (payload) => {
          console.log('Received real-time update:', payload);
          fetchCalls();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCalls = async () => {
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
      return;
    }

    setCalls(data || []);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Live Callers</h1>
          <div className="flex items-center gap-4">
            <Link 
              to="/connect" 
              className="flex items-center gap-2 text-primary hover:text-primary/80"
            >
              <PhoneIncoming className="h-5 w-5" />
              <span>Callers</span>
            </Link>
            <CallControls calls={calls} />
          </div>
        </div>

        <CallGrid 
          calls={calls} 
          fullscreenCall={fullscreenCall}
          setFullscreenCall={setFullscreenCall}
        />
      </div>
    </div>
  );
};

export default Calls;