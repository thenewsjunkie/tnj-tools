import { useEffect } from "react";
import { useQueueState } from "@/hooks/useQueueState";
import { useAlertQueue } from "@/hooks/useAlertQueue";
import { supabase } from "@/integrations/supabase/client";

const GlobalQueueManager = () => {
  const { isPaused } = useQueueState();
  const { currentAlert, processNextAlert } = useAlertQueue();

  useEffect(() => {
    console.log('[GlobalQueueManager] Initializing');
    
    // If there's no current alert and the queue isn't paused, try to process the next alert
    if (!currentAlert && !isPaused) {
      console.log('[GlobalQueueManager] No current alert, attempting to process next');
      processNextAlert(isPaused);
    }
  }, [currentAlert, isPaused, processNextAlert]);

  useEffect(() => {
    console.log('[GlobalQueueManager] Setting up realtime subscription');
    
    const channel = supabase.channel('alert-queue')
      .on('broadcast', { event: 'alert_completed' }, async () => {
        console.log('[GlobalQueueManager] Alert completed event received');
        if (!isPaused) {
          processNextAlert(isPaused);
        }
      })
      .subscribe();

    return () => {
      console.log('[GlobalQueueManager] Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [processNextAlert, isPaused]);

  return null;
};

export default GlobalQueueManager;