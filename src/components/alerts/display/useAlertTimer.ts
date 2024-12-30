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
    console.log('[AlertTimer] Component mounted or alert changed');
    completedRef.current = false;
    
    if (!currentAlert) {
      console.log('[AlertTimer] No alert to display');
      return;
    }

    // For non-gift alerts, use a fixed duration that matches the video/audio length
    if (!currentAlert.is_gift_alert) {
      console.log('[AlertTimer] Regular alert - using fixed duration');
      const timer = setTimeout(() => {
        console.log('[AlertTimer] Regular alert completed');
        completedRef.current = true;
        onComplete();
      }, 5000);

      return () => {
        console.log('[AlertTimer] Cleanup - clearing regular alert timer');
        clearTimeout(timer);
      };
    }

    // Gift alert specific timing logic
    if (currentAlert.is_gift_alert && currentAlert.gift_count) {
      console.log('[AlertTimer] Gift alert detected - calculating duration');
      const giftCount = currentAlert.gift_count;
      const baseAnimationSpeed = currentAlert.gift_count_animation_speed || 100;
      
      // Calculate total animation time needed based on gift count
      const paddingTime = 3000; // Reduced from 5000 to 3000 milliseconds
      const totalAnimationTime = giftCount * baseAnimationSpeed;
      const timeout = totalAnimationTime + paddingTime;
      
      console.log('[AlertTimer] Gift alert timing details:', {
        giftCount,
        baseAnimationSpeed,
        totalAnimationTime,
        paddingTime,
        finalTimeout: timeout
      });

      const timer = setTimeout(() => {
        console.log('[AlertTimer] Gift alert completed - showing scoreboard');
        onShowScoreboard();
      }, timeout);
      
      return () => {
        console.log('[AlertTimer] Cleanup - clearing gift alert timer');
        clearTimeout(timer);
      };
    }
  }, [currentAlert, onComplete, onShowScoreboard]);

  return { completedRef };
};