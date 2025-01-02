import { useEffect, useRef } from "react";
import { useQueueState } from "@/hooks/useQueueState";
import { useAlertQueue } from "@/hooks/useAlertQueue";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

const GlobalQueueManager = () => {
  const { isPaused } = useQueueState();
  const { currentAlert, processNextAlert, handleAlertComplete } = useAlertQueue();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isInitializedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    if (!channelRef.current) {
      channelRef.current = supabase.channel('alert-queue')
        .on('broadcast', { event: 'alert_completed' }, (payload) => {
          console.log('[GlobalQueueManager] Received alert completion broadcast:', payload);
          // Only process next alert if not paused
          if (!isPaused) {
            console.log('[GlobalQueueManager] Queue not paused, processing next alert');
            processNextAlert(isPaused);
          } else {
            console.log('[GlobalQueueManager] Queue is paused, not processing next alert');
          }
        })
        .subscribe();

      // Only process initial alert if not paused and no current alert
      if (!currentAlert && !isPaused) {
        console.log('[GlobalQueueManager] No current alert and queue not paused, processing initial alert');
        processNextAlert(isPaused);
      } else {
        console.log('[GlobalQueueManager] Queue is paused or has current alert, not processing initial alert');
      }
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPaused, currentAlert, processNextAlert]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Only set up timer if there's a current alert and queue is not paused
    if (currentAlert && !isPaused) {
      let timeout = 6000; // Base timeout for video alerts
      
      if (currentAlert.alert?.is_gift_alert) {
        const giftCount = currentAlert.gift_count || 1;
        const baseAnimationSpeed = currentAlert.alert.gift_count_animation_speed || 100;
        
        const firstSegmentCount = Math.min(10, giftCount);
        const secondSegmentCount = Math.max(0, Math.min(40, giftCount - 10));
        const thirdSegmentCount = Math.max(0, giftCount - 50);
        
        const firstSegmentTime = firstSegmentCount * baseAnimationSpeed;
        const secondSegmentTime = secondSegmentCount * (baseAnimationSpeed / 1.5);
        const thirdSegmentTime = thirdSegmentCount * (baseAnimationSpeed / 3);
        
        const countingTime = firstSegmentTime + secondSegmentTime + thirdSegmentTime;
        
        timeout = 8000 + countingTime + 2000;
      } else if (currentAlert.alert?.media_type && !currentAlert.alert.media_type.startsWith('video')) {
        timeout = 5000;
      }
      
      console.log('[GlobalQueueManager] Setting up alert completion timer for', timeout, 'ms');
      timerRef.current = setTimeout(async () => {
        await handleAlertComplete();
      }, timeout);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentAlert, isPaused, handleAlertComplete]);

  return null;
};

export default GlobalQueueManager;