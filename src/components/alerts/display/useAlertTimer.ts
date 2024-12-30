import { useEffect, useRef } from "react";

interface UseAlertTimerProps {
  currentAlert: {
    is_gift_alert?: boolean;
    media_type?: string;
  };
  onComplete: () => void;
  onShowLeaderboard?: () => void;
}

export const useAlertTimer = ({ currentAlert, onComplete }: UseAlertTimerProps) => {
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
      if (!completedRef.current) {
        console.log('[useAlertTimer] Triggering completion callback');
        completedRef.current = true;
        onComplete();
      }
    }, 5000); // 5 seconds for non-video alerts

    return () => {
      clearTimeout(timer);
    };
  }, [currentAlert, onComplete]);

  return { completedRef };
};