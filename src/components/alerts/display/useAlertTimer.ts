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

    // Calculate timeout based on alert type
    let timeout = 5000; // Default timeout of 5 seconds for regular alerts
    
    if (currentAlert.is_gift_alert && currentAlert.gift_count) {
      const giftCount = currentAlert.gift_count;
      const baseAnimationSpeed = currentAlert.gift_count_animation_speed || 100;
      
      // Calculate total animation time needed based on gift count
      const paddingTime = 5000; // Padding time in milliseconds
      
      // Simplified timing calculation to ensure consistent counting
      const totalAnimationTime = giftCount * baseAnimationSpeed;
      
      // Set timeout to total animation time plus padding
      timeout = totalAnimationTime + paddingTime;
      
      console.log('[AlertTimer] Gift alert timing details:', {
        giftCount,
        baseAnimationSpeed,
        totalAnimationTime,
        paddingTime,
        finalTimeout: timeout
      });
    }

    const timer = setTimeout(() => {
      console.log('[AlertTimer] Timer completed');
      if (currentAlert.is_gift_alert) {
        onShowScoreboard();
      } else {
        completedRef.current = true;
        onComplete();
      }
    }, timeout);
    
    return () => {
      console.log('[AlertTimer] Cleanup - clearing timer');
      clearTimeout(timer);
    };
  }, [currentAlert, onComplete, onShowScoreboard]);

  return { completedRef };
};