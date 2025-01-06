import { useState } from "react";
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
  };
  onComplete: () => void;
}

export const AlertDisplay = ({
  currentAlert,
  onComplete,
}: AlertDisplayProps) => {
  const [hasError, setHasError] = useState(false);

  const handleError = (error: any) => {
    console.error('[AlertDisplay] Media error:', error);
    console.error('[AlertDisplay] Failed media details:', {
      type: currentAlert.media_type,
      url: currentAlert.media_url
    });
    setHasError(true);
  };

  const handleAlertContentComplete = () => {
    console.log('[AlertDisplay] Alert content completed');
    onComplete();
  };

  // Use alert timer
  useAlertTimer({
    currentAlert,
    onComplete: handleAlertContentComplete
  });

  // Add detailed debug logging
  console.log('[AlertDisplay] Rendering alert with details:', {
    mediaType: currentAlert.media_type,
    mediaUrl: currentAlert.media_url,
    isGiftAlert: currentAlert.is_gift_alert,
    hasError,
    messageEnabled: currentAlert.message_enabled,
    messageText: currentAlert.message_text,
    fullAlert: currentAlert
  });

  if (!currentAlert) {
    console.log('[AlertDisplay] No alert to render');
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <AlertContent
        currentAlert={currentAlert}
        onComplete={handleAlertContentComplete}
        onError={handleError}
      />
    </div>
  );
};