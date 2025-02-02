import { useState, useEffect } from "react";
import { AlertContent } from "./display/AlertContent";

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
    repeat_count?: number;
    repeat_delay?: number;
  };
  onComplete: () => void;
}

export const AlertDisplay = ({
  currentAlert,
  onComplete,
}: AlertDisplayProps) => {
  const [hasError, setHasError] = useState(false);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    console.log('[AlertDisplay] Alert mounted:', {
      mediaType: currentAlert.media_type,
      mediaUrl: currentAlert.media_url,
      isGiftAlert: currentAlert.is_gift_alert,
      displayDuration: currentAlert.display_duration,
      messageEnabled: currentAlert.message_enabled,
      messageText: currentAlert.message_text,
      repeatCount: currentAlert.repeat_count,
      repeatDelay: currentAlert.repeat_delay
    });
    
    return () => {
      console.log('[AlertDisplay] Alert unmounted');
    };
  }, [currentAlert]);

  const handleError = (error: any) => {
    console.error('[AlertDisplay] Error:', error);
    setHasError(true);
    if (!isCompleting) {
      setIsCompleting(true);
      onComplete();
    }
  };

  const handleMediaLoaded = () => {
    console.log('[AlertDisplay] Media loaded');
    setIsMediaLoaded(true);
  };

  const handleAlertContentComplete = () => {
    console.log('[AlertDisplay] Alert content completed');
    if (!isCompleting) {
      setIsCompleting(true);
      onComplete();
    }
  };

  if (!currentAlert) {
    console.log('[AlertDisplay] No alert to render');
    return null;
  }

  return (
    <AlertContent
      currentAlert={{
        ...currentAlert,
        repeat_count: currentAlert.repeat_count,
        repeat_delay: currentAlert.repeat_delay
      }}
      onComplete={handleAlertContentComplete}
      onError={handleError}
      onMediaLoaded={handleMediaLoaded}
    />
  );
};