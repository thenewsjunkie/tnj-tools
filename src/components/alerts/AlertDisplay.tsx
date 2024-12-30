import { useState } from "react";
import { AlertContent } from "./display/AlertContent";
import { GiftLeaderboard } from "./display/GiftLeaderboard";
import { useAlertTimer } from "./display/useAlertTimer";
import { useGiftLeaderboardTimer } from "./display/useGiftLeaderboardTimer";

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
  const [showingLeaderboard, setShowingLeaderboard] = useState(false);

  const handleShowLeaderboard = () => {
    console.log('[AlertDisplay] Showing gift leaderboard for gift alert');
    setShowingLeaderboard(true);
  };

  const { completedRef } = useAlertTimer({
    currentAlert,
    onComplete,
    onShowScoreboard: handleShowLeaderboard
  });

  useGiftLeaderboardTimer({
    showingLeaderboard,
    onComplete,
    completedRef
  });

  const handleImageError = (error: any) => {
    console.error('[AlertDisplay] Image error:', error);
    completedRef.current = true;
    onComplete();
  };

  if (!currentAlert) {
    console.log('[AlertDisplay] No alert to render');
    return null;
  }

  // Add debug logging to help troubleshoot
  console.log('[AlertDisplay] Current state:', {
    showingLeaderboard,
    isGiftAlert: currentAlert.is_gift_alert,
    currentAlert
  });

  if (showingLeaderboard) {
    console.log('[AlertDisplay] Rendering gift leaderboard');
    return <GiftLeaderboard limit={5} />;
  }

  return (
    <AlertContent
      currentAlert={currentAlert}
      onComplete={onComplete}
      onError={handleImageError}
    />
  );
};