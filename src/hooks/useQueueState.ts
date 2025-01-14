import { useState, useCallback } from 'react';
import { useRealtimeConnection } from './useRealtimeConnection';

export const useQueueState = () => {
  const [currentAlert, setCurrentAlert] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);

  const handleQueueEvent = useCallback((payload: any) => {
    if (payload.new && payload.new.status === 'playing') {
      console.log('[useQueueState] Current alert changed:', payload.new);
      setCurrentAlert(payload.new);
      setIsPaused(false);
    } else if (payload.new && payload.new.status === 'completed') {
      if (currentAlert && currentAlert.id === payload.new.id) {
        console.log('[useQueueState] Current alert completed');
        setCurrentAlert(null);
      }
    }
  }, [currentAlert]);

  const { isConnected } = useRealtimeConnection(
    'queue-state-changes',
    'UPDATE',
    'alert_queue',
    handleQueueEvent
  );

  return {
    currentAlert,
    isPaused,
    setIsPaused,
    isConnected
  };
};