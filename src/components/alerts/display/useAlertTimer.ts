import { useEffect, useRef } from "react";

interface UseAlertTimerProps {
  currentAlert: {
    media_type: string;
    media_url: string;
    display_duration?: number;
  };
  onComplete: () => void;
}

export const useAlertTimer = ({
  currentAlert,
  onComplete
}: UseAlertTimerProps) => {
  const completedRef = useRef(false);

  useEffect(() => {
    if (!currentAlert) return;

    // Use the alert's display duration (in seconds) or fallback to 5 seconds
    const displayDuration = (currentAlert.display_duration ?? 5) * 1000;

    console.log('[AlertTimer] Setting timer for', displayDuration, 'ms');
    
    const timer = setTimeout(() => {
      if (!completedRef.current) {
        console.log('[AlertTimer] Alert display timeout reached');
        completedRef.current = true;
        onComplete();
      }
    }, displayDuration);

    return () => {
      clearTimeout(timer);
      completedRef.current = false;
    };
  }, [currentAlert, onComplete]);

  return { completedRef };
};