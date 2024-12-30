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
    console.error('[AlertDisplay] Error:', error);
    setHasError(true);
    onComplete();
  };

  const handleAlertContentComplete = () => {
    console.log('[AlertDisplay] Alert content completed');
    if (currentAlert.is_gift_alert && !hasError) {
      // Instead of showing leaderboard directly, open it in new window
      const leaderboardUrl = new URL('/leaderboard/obs', window.location.origin);
      leaderboardUrl.searchParams.set('show', 'true');
      window.open(leaderboardUrl.toString(), 'gift_leaderboard');
    }
    onComplete();
  };

  const { completedRef } = useAlertTimer({
    currentAlert,
    onComplete: handleAlertContentComplete
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
    />
  );
};