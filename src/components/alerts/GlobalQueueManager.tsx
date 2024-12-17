import { useEffect, useRef } from "react";
import { useQueueState } from "@/hooks/useQueueState";
import { useAlertQueue } from "@/hooks/useAlertQueue";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

const GlobalQueueManager = () => {
  const { isPaused } = useQueueState();
  const { currentAlert, processNextAlert } = useAlertQueue();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    console.log('[GlobalQueueManager] Initializing');
    
    // If there's no current alert and the queue isn't paused, try to process the next alert
    if (!currentAlert && !isPaused) {
      console.log('[GlobalQueueManager] No current alert, attempting to process next');
      processNextAlert(isPaused);
    }

    // Only set up subscription if we don't already have one
    if (!channelRef.current) {
      console.log('[GlobalQueueManager] Setting up realtime subscription');
      
      channelRef.current = supabase.channel('alert-queue')
        .on('broadcast', { event: 'alert_completed' }, async () => {
          console.log('[GlobalQueueManager] Alert completed event received');
          if (!isPaused) {
            processNextAlert(isPaused);
          }
        })
        .subscribe((status) => {
          console.log('[GlobalQueueManager] Subscription status:', status);
        });
    }

    return () => {
      if (channelRef.current) {
        console.log('[GlobalQueueManager] Cleaning up realtime subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [processNextAlert, isPaused, currentAlert]);

  return null;
};

export default GlobalQueueManager;