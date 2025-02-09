
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
  const [currentRepeat, setCurrentRepeat] = useState(0);

  useEffect(() => {
    console.log('[AlertDisplay] Alert mounted:', {
      mediaType: currentAlert.media_type,
      mediaUrl: currentAlert.media_url,
      isGiftAlert: currentAlert.is_gift_alert,
      displayDuration: currentAlert.display_duration,
      messageEnabled: currentAlert.message_enabled,
      messageText: currentAlert.message_text,
      repeatCount: currentAlert.repeat_count,
      repeatDelay: currentAlert.repeat_delay,
      currentRepeat
    });
    
    return () => {
      console.log('[AlertDisplay] Alert unmounted');
    };
  }, [currentAlert, currentRepeat]);

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
    console.log('[AlertDisplay] Alert content completed, current repeat:', currentRepeat);
    
    const targetRepeatCount = currentAlert.repeat_count ?? 1;
    
    if (currentRepeat < targetRepeatCount - 1) {
      // If we haven't reached the target repeat count, increment and continue
      setCurrentRepeat(prev => prev + 1);
    } else {
      // If we've reached the target repeat count, complete the alert
      if (!isCompleting) {
        console.log('[AlertDisplay] All repeats completed, triggering onComplete');
        setIsCompleting(true);
        onComplete();
      }
    }
  };

  if (!currentAlert) {
    console.log('[AlertDisplay] No alert to render');
    return null;
  }

  // Transform the alert data, preserving original values if they exist
  const transformedAlert = {
    mediaType: currentAlert.media_type,
    mediaUrl: currentAlert.media_url,
    messageEnabled: currentAlert.message_enabled,
    messageText: currentAlert.message_text,
    fontSize: currentAlert.font_size,
    isGiftAlert: currentAlert.is_gift_alert,
    giftCount: currentAlert.gift_count,
    giftCountAnimationSpeed: currentAlert.gift_count_animation_speed,
    giftTextColor: currentAlert.gift_text_color,
    giftCountColor: currentAlert.gift_count_color,
    // Only use default values if the properties are actually undefined
    repeatCount: currentAlert.repeat_count ?? 1,
    repeatDelay: currentAlert.repeat_delay ?? 1000,
    currentRepeat // Pass the current repeat count to AlertContent
  };

  console.log('[AlertDisplay] Rendering alert content with transformed data:', transformedAlert);

  return (
    <AlertContent
      currentAlert={transformedAlert}
      onComplete={handleAlertContentComplete}
      onError={handleError}
      onMediaLoaded={handleMediaLoaded}
    />
  );
};
