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

  const handleError = (error: any) => {
    console.error('[AlertDisplay] Error:', error);
    onComplete();
  };

  const handleAlertContentComplete = () => {
    console.log('[AlertDisplay] Alert content completed');
    if (currentAlert.is_gift_alert) {
      handleShowLeaderboard();
    } else {
      onComplete();
    }
  };

  const { completedRef } = useAlertTimer({
    currentAlert,
    onComplete: handleAlertContentComplete,
    onShowLeaderboard: handleShowLeaderboard
  });

  useGiftLeaderboardTimer({
    showingLeaderboard,
    onComplete,
    completedRef
  });

  // Add debug logging
  console.log('[AlertDisplay] Current state:', {
    showingLeaderboard,
    isGiftAlert: currentAlert.is_gift_alert,
    currentAlert
  });

  if (!currentAlert) {
    console.log('[AlertDisplay] No alert to render');
    return null;
  }

  if (showingLeaderboard) {
    console.log('[AlertDisplay] Rendering gift leaderboard');
    return (
      <div className="fixed inset-0 flex items-center justify-center z-[9999] transition-opacity duration-300">
        <GiftLeaderboard limit={5} fadeBelow={5} />
      </div>
    );
  }

  return (
    <AlertContent
      currentAlert={currentAlert}
      onComplete={handleAlertContentComplete}
      onError={handleError}
    />
  );
};