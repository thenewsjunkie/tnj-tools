import { useEffect } from "react";
import { useQueueState } from "@/hooks/useQueueState";
import { useToast } from "@/components/ui/use-toast";

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
        const newState = await togglePause();
        console.log('[QueueControlHandler] Queue state updated to:', newState ? 'paused' : 'playing');
        
        toast({
          title: `Queue ${newState ? 'Paused' : 'Playing'}`,
          description: `Alert queue has been ${newState ? 'paused' : 'resumed'} via URL control`,
        });
      } else {
        console.log('[QueueControlHandler] Queue state already matches desired state');
      }
    };

    handleQueueControl();
  }, [action, togglePause, isPaused, toast]);

  return null;
};

export default QueueControlHandler;