import { useState, useEffect } from "react";
import { AlertContent } from "./display/AlertContent";
import { alertLogger } from "@/utils/alertLogger";

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
    alertLogger.alertDisplay('Alert mounted:', {
      mediaType: currentAlert.media_type,
      mediaUrl: currentAlert.media_url,
      repeatCount: currentAlert.repeat_count,
      repeatDelay: currentAlert.repeat_delay
    });
    
    return () => {
      alertLogger.alertDisplay('Alert unmounted');
    };
  }, [currentAlert]);

  const handleError = (error: any) => {
    alertLogger.alertDisplay('Error:', error);
    setHasError(true);
    if (!isCompleting) {
      setIsCompleting(true);
      onComplete();
    }
  };

  const handleMediaLoaded = () => {
    alertLogger.alertDisplay('Media loaded');
    setIsMediaLoaded(true);
  };

  const handleAlertContentComplete = () => {
    alertLogger.alertDisplay('Alert content completed');
    if (!isCompleting) {
      setIsCompleting(true);
      onComplete();
    }
  };

  if (!currentAlert) {
    return null;
  }

  // Transform the alert data, preserving original values
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
    repeatCount: currentAlert.repeat_count ?? 1,
    repeatDelay: currentAlert.repeat_delay ?? 1000
  };

  return (
    <AlertContent
      currentAlert={transformedAlert}
      onComplete={handleAlertContentComplete}
      onError={handleError}
      onMediaLoaded={handleMediaLoaded}
    />
  );
};