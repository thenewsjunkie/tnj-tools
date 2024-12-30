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
  const leaderboardWindowRef = useRef<Window | null>(null);

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

  const showLeaderboard = () => {
    // Close existing window if it exists
    if (leaderboardWindowRef.current) {
      leaderboardWindowRef.current.close();
    }

    // Calculate position to center the window
    const width = 400;
    const height = 500;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    // Open new window with specific dimensions
    leaderboardWindowRef.current = window.open(
      '/leaderboard/obs',
      'LeaderboardOBS',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (currentAlert && !isPaused) {
      console.log('[GlobalQueueManager] Setting up completion timer for alert:', currentAlert.id);
      
      let timeout = 8000; // Default 8 seconds for video alerts
      
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

        // If this was a gift alert, show the leaderboard
        if (currentAlert.alert.is_gift_alert) {
          console.log('[GlobalQueueManager] Gift alert completed, showing leaderboard');
          showLeaderboard();
        }
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