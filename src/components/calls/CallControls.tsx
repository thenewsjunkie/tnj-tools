import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface CallControlsProps {
  calls: CallSession[];
}

export const CallControls = ({ calls }: CallControlsProps) => {
  const { toast } = useToast();

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
    <div className="flex gap-2">
      <Button onClick={muteAll} variant="outline">Mute All</Button>
      <Button onClick={unmuteAll} variant="outline">Unmute All</Button>
      <Button onClick={endAllCalls} variant="destructive">End All Calls</Button>
    </div>
  );
};