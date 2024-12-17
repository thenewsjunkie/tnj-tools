import { useEffect } from "react";
import { useQueueState } from "@/hooks/useQueueState";

interface QueueControlHandlerProps {
  action?: string;
}

const QueueControlHandler = ({ action }: QueueControlHandlerProps) => {
  const { togglePause } = useQueueState();

  useEffect(() => {
    const handleQueueControl = async () => {
      if (!action || !action.match(/^(play|stop)$/)) return;

      console.log('[QueueControlHandler] Queue control action:', action);
      
      const shouldPause = action === 'stop';
      const newState = await togglePause();
      
      // If the current state doesn't match what we want, toggle it
      if (newState === shouldPause) {
        console.log('[QueueControlHandler] Queue state already matches desired state');
        return;
      }
      
      await togglePause();
      console.log('[QueueControlHandler] Queue state updated to:', action === 'stop' ? 'paused' : 'playing');
    };

    handleQueueControl();
  }, [action, togglePause]);

  return null;
};

export default QueueControlHandler;