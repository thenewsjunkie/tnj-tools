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
        .on('broadcast', { event: 'alert_completed' }, () => {
          if (!isPaused) {
            processNextAlert(isPaused);
          }
        })
        .subscribe();

      if (!currentAlert && !isPaused) {
        processNextAlert(isPaused);
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