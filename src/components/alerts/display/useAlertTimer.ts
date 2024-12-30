import { useEffect, useRef } from "react";

interface UseAlertTimerProps {
  currentAlert: {
    is_gift_alert?: boolean;
    gift_count?: number;
    gift_count_animation_speed?: number;
  };
  onComplete: () => void;
  onShowScoreboard: () => void;
}

export const useAlertTimer = ({ currentAlert, onComplete, onShowScoreboard }: UseAlertTimerProps) => {
  const completedRef = useRef(false);

  useEffect(() => {
    console.log('[useAlertTimer] Starting timer for alert:', currentAlert);
    completedRef.current = false;
    
    if (!currentAlert) {
      console.log('[useAlertTimer] No alert to display');
      return;
    }

    // For non-gift alerts, use a fixed duration that matches the video/audio length
    if (!currentAlert.is_gift_alert) {
      console.log('[useAlertTimer] Regular alert - using fixed duration');
      const timer = setTimeout(() => {
        console.log('[useAlertTimer] Regular alert completed');
        completedRef.current = true;
        onComplete();
      }, 5000);

      return () => {
        console.log('[useAlertTimer] Cleanup - clearing regular alert timer');
        clearTimeout(timer);
      };
    }

    // Gift alert specific timing logic
    if (currentAlert.is_gift_alert && currentAlert.gift_count) {
      console.log('[useAlertTimer] Gift alert detected - calculating duration');
      const giftCount = currentAlert.gift_count;
      const baseAnimationSpeed = currentAlert.gift_count_animation_speed || 100;
      
      // Calculate total animation time needed based on gift count
      const paddingTime = 3000;
      const totalAnimationTime = giftCount * baseAnimationSpeed;
      const timeout = totalAnimationTime + paddingTime;
      
      console.log('[useAlertTimer] Gift alert timing details:', {
        giftCount,
        baseAnimationSpeed,
        totalAnimationTime,
        paddingTime,
        finalTimeout: timeout
      });

      const timer = setTimeout(() => {
        console.log('[useAlertTimer] Alert timer completed');
        console.log('[useAlertTimer] This is a gift alert, showing scoreboard');
        onShowScoreboard();
      }, timeout);
      
      return () => {
        console.log('[useAlertTimer] Cleanup - clearing gift alert timer');
        clearTimeout(timer);
      };
    }
  }, [currentAlert, onComplete, onShowScoreboard]);

  return { completedRef };
};