import { useEffect } from "react";
import { useQueueState } from "@/hooks/useQueueState";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface QueueControlHandlerProps {
  action?: string;
}

const QueueControlHandler = ({ action }: QueueControlHandlerProps) => {
  const { togglePause, isPaused } = useQueueState();
  const { toast } = useToast();

  useEffect(() => {
    const handleQueueControl = async () => {
      if (!action || !action.match(/^(play|stop)$/)) return;

      console.log('[QueueControlHandler] Queue control action:', action);
      
      const shouldPause = action === 'stop';
      
      // Only toggle if current state doesn't match desired state
      if (shouldPause !== isPaused) {
        // Update system_settings directly
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            key: 'queue_state',
            value: { isPaused: shouldPause } as unknown as Json,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('[QueueControlHandler] Error updating queue state:', error);
          toast({
            title: "Error",
            description: "Failed to update queue state",
            variant: "destructive",
          });
          return;
        }

        console.log('[QueueControlHandler] Queue state updated to:', shouldPause ? 'paused' : 'playing');
        
        toast({
          title: `Queue ${shouldPause ? 'Paused' : 'Playing'}`,
          description: `Alert queue has been ${shouldPause ? 'paused' : 'resumed'} via URL control`,
        });
      } else {
        console.log('[QueueControlHandler] Queue state already matches desired state');
      }
    };

    handleQueueControl();
  }, [action, isPaused, toast]);

  return null;
};

export default QueueControlHandler;