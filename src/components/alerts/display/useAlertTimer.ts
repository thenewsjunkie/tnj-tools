import { useEffect, useRef } from "react";

interface UseAlertTimerProps {
  currentAlert: {
    media_type: string;
    media_url: string;
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

    const timer = setTimeout(() => {
      if (!completedRef.current) {
        console.log('[AlertTimer] Alert display timeout reached');
        completedRef.current = true;
        onComplete();
      }
    }, 10000); // 10 seconds timeout

    return () => {
      clearTimeout(timer);
      completedRef.current = false;
    };
  }, [currentAlert, onComplete]);

  return { completedRef };
};