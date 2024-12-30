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
    
    // Only set up subscription if we don't already have one
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

      // If there's no current alert and the queue isn't paused, try to process the next alert
      if (!currentAlert && !isPaused) {
        console.log('[GlobalQueueManager] No current alert, attempting to process next');
        processNextAlert(isPaused);
      }
    }

    // Cleanup function
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

  // Set up timer when current alert changes
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (currentAlert && !isPaused) {
      console.log('[GlobalQueueManager] Setting up completion timer for alert:', currentAlert.id);
      
      // Calculate timeout based on alert type
      let timeout = 15000; // Default 15 seconds
      
      if (currentAlert.alert.is_gift_alert) {
        // For gift alerts, give more time for the counting animation
        const giftCount = currentAlert.gift_count || 1;
        const animationSpeed = currentAlert.alert.gift_count_animation_speed || 100;
        // Base time (20s) plus time for counting animation
        timeout = 20000 + (giftCount * animationSpeed);
      } else if (!currentAlert.alert.media_type.startsWith('video')) {
        timeout = 5000; // 5 seconds for regular image alerts
      }
      
      timerRef.current = setTimeout(() => {
        console.log('[GlobalQueueManager] Alert timeout reached, marking as complete');
        handleAlertComplete();
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