import { useEffect, useRef } from "react";

interface UseAlertTimerProps {
  currentAlert: {
    is_gift_alert?: boolean;
    media_type?: string;
  };
  onComplete: () => void;
  onShowScoreboard: () => void;
}

export const useAlertTimer = ({ currentAlert, onComplete, onShowScoreboard }: UseAlertTimerProps) => {
  const completedRef = useRef(false);

  useEffect(() => {
    console.log('[useAlertTimer] Starting timer for alert:', currentAlert);
    
    // For video alerts, let the video completion trigger the next step
    if (currentAlert.media_type?.startsWith('video')) {
      console.log('[useAlertTimer] Video alert - waiting for video completion');
      return;
    }

    // For other alerts, use a timer
    const timer = setTimeout(() => {
      console.log('[useAlertTimer] Alert timer completed');
      if (currentAlert.is_gift_alert) {
        console.log('[useAlertTimer] This is a gift alert, showing scoreboard');
        onShowScoreboard();
      } else {
        console.log('[useAlertTimer] This is not a gift alert, completing');
        completedRef.current = true;
        onComplete();
      }
    }, 5000); // 5 seconds for non-video alerts

    return () => {
      clearTimeout(timer);
    };
  }, [currentAlert, onComplete, onShowScoreboard]);

  return { completedRef };
};