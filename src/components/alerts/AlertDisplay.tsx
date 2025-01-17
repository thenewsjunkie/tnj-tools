import { useState, useEffect } from "react";
import { AlertContent } from "./display/AlertContent";
import { useAlertTimer } from "./display/useAlertTimer";

interface AlertDisplayProps {
  currentAlert: {
    media_type: string;
    media_url: string;
    message_enabled?: boolean;
    message_text?: string;
    font_size?: number;
    is_gift_alert?: boolean;
    gift_count?: number;
    gift_count_animation_speed?: number;
    gift_text_color?: string;
    gift_count_color?: string;
    display_duration?: number;
  };
  onComplete: () => void;
}

export const AlertDisplay = ({
  currentAlert,
  onComplete,
}: AlertDisplayProps) => {
  const [hasError, setHasError] = useState(false);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);

  useEffect(() => {
    console.log('[AlertDisplay] Alert mounted:', {
      mediaType: currentAlert.media_type,
      mediaUrl: currentAlert.media_url,
      isGiftAlert: currentAlert.is_gift_alert,
      displayDuration: currentAlert.display_duration
    });
    
    return () => {
      console.log('[AlertDisplay] Alert unmounted');
    };
  }, [currentAlert]);

  const handleError = (error: any) => {
    console.error('[AlertDisplay] Error:', error);
    setHasError(true);
    onComplete();
  };

  const handleMediaLoaded = () => {
    console.log('[AlertDisplay] Media loaded');
    setIsMediaLoaded(true);
  };

  const handleAlertContentComplete = () => {
    console.log('[AlertDisplay] Alert content completed');
    onComplete();
  };

  // Use alert timer with display_duration
  useAlertTimer({
    currentAlert,
    onComplete: handleAlertContentComplete
  });

  // Add debug logging
  console.log('[AlertDisplay] Current state:', {
    isGiftAlert: currentAlert.is_gift_alert,
    hasError,
    isMediaLoaded,
    currentAlert
  });

  if (!currentAlert) {
    console.log('[AlertDisplay] No alert to render');
    return null;
  }

  return (
    <AlertContent
      currentAlert={currentAlert}
      onComplete={handleAlertContentComplete}
      onError={handleError}
      onMediaLoaded={handleMediaLoaded}
    />
  );
};