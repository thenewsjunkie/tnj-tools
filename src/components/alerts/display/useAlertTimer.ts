import { useEffect, useRef } from "react";

interface UseAlertTimerProps {
  currentAlert: {
    is_gift_alert?: boolean;
  };
  onComplete: () => void;
  onShowScoreboard: () => void;
}

export const useAlertTimer = ({ currentAlert, onComplete, onShowScoreboard }: UseAlertTimerProps) => {
  const completedRef = useRef(false);

  useEffect(() => {
    console.log('[useAlertTimer] Starting timer for alert:', currentAlert);
    
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
    }, 5000); // 5 seconds for the initial alert

    return () => {
      clearTimeout(timer);
    };
  }, [currentAlert, onComplete, onShowScoreboard]);

  return { completedRef };
};