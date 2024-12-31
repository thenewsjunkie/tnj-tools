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

    console.log('[GlobalQueueManager] Initializing');
    
    if (!channelRef.current) {
      console.log('[GlobalQueueManager] Setting up realtime subscription');
      
      channelRef.current = supabase.channel('alert-queue')
        .on('broadcast', { event: 'alert_completed' }, () => {
          console.log('[GlobalQueueManager] Alert completed event received');
          if (!isPaused) {
            console.log('[GlobalQueueManager] Processing next alert after completion');
            processNextAlert(isPaused);
          }
        })
        .subscribe((status) => {
          console.log('[GlobalQueueManager] Subscription status:', status);
        });

      if (!currentAlert && !isPaused) {
        console.log('[GlobalQueueManager] No current alert, attempting to process next');
        processNextAlert(isPaused);
      }
    }

    return () => {
      if (channelRef.current) {
        console.log('[GlobalQueueManager] Cleaning up realtime subscription');
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
      console.log('[GlobalQueueManager] Setting up completion timer for alert:', currentAlert);
      
      let timeout = 6000; // Base timeout for video alerts
      
      if (currentAlert.alert?.is_gift_alert) {
        console.log('[GlobalQueueManager] Setting up gift alert timer');
        // For gift alerts, calculate time based on count
        const giftCount = currentAlert.gift_count || 1;
        const animationSpeed = currentAlert.alert.gift_count_animation_speed || 100;
        
        // Progressive timing formula:
        // - First 10 gifts: full animation speed
        // - 11-50 gifts: gradually faster
        // - 50+ gifts: even faster to prevent extremely long waits
        let countingTime;
        if (giftCount <= 10) {
          countingTime = giftCount * animationSpeed;
        } else if (giftCount <= 50) {
          countingTime = (10 * animationSpeed) + ((giftCount - 10) * (animationSpeed * 0.7));
        } else {
          countingTime = (10 * animationSpeed) + (40 * (animationSpeed * 0.7)) + 
                        ((giftCount - 50) * (animationSpeed * 0.4));
        }
        
        // Base time (8s) plus calculated counting time plus buffer
        timeout = 8000 + countingTime + 2000;
        
        console.log('[GlobalQueueManager] Calculated gift alert timeout:', {
          giftCount,
          animationSpeed,
          countingTime,
          totalTimeout: timeout
        });
      } else if (currentAlert.alert?.media_type && !currentAlert.alert.media_type.startsWith('video')) {
        timeout = 5000; // 5 seconds for regular image alerts
      }
      
      console.log('[GlobalQueueManager] Setting timer for', timeout, 'ms');
      
      timerRef.current = setTimeout(async () => {
        console.log('[GlobalQueueManager] Alert timeout reached, marking as complete');
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