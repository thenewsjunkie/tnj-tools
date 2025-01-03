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
    
    const setupChannel = async () => {
      if (!channelRef.current) {
        // Get current queue state from database to ensure consistency
        const { data: settings } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'queue_state')
          .single();
        
        const queueState = settings?.value as { isPaused: boolean } | null;
        const currentlyPaused = queueState?.isPaused ?? false;
        
        console.log('[GlobalQueueManager] Setting up realtime channel. Initial queue state:', { currentlyPaused });

        channelRef.current = supabase.channel('alert-queue')
          .on(
            'postgres_changes',
            { 
              event: 'UPDATE',
              schema: 'public',
              table: 'alert_queue',
              filter: 'status=eq.completed'
            },
            (payload) => {
              console.log('[GlobalQueueManager] Received alert completion update:', payload);
              // Recheck pause state before processing next alert
              if (!currentlyPaused) {
                console.log('[GlobalQueueManager] Queue not paused, processing next alert');
                processNextAlert(false);
              } else {
                console.log('[GlobalQueueManager] Queue is paused, not processing next alert');
              }
            }
          )
          .subscribe((status) => {
            console.log('[GlobalQueueManager] Realtime subscription status:', status);
          });

        // Only process initial alert if not paused and no current alert
        if (!currentAlert && !currentlyPaused) {
          console.log('[GlobalQueueManager] No current alert and queue not paused, processing initial alert');
          processNextAlert(false);
        } else {
          console.log('[GlobalQueueManager] Queue is paused or has current alert, not processing initial alert');
        }
      }
    };

    setupChannel();

    return () => {
      if (channelRef.current) {
        console.log('[GlobalQueueManager] Cleaning up realtime channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [currentAlert, processNextAlert]);

  // Effect to handle alert completion timing
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

  // Effect to handle pause state changes
  useEffect(() => {
    console.log('[GlobalQueueManager] Pause state changed:', isPaused);
    
    // If queue is paused, clear any existing completion timer
    if (isPaused && timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [isPaused]);

  return null;
};

export default GlobalQueueManager;