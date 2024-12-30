import { useState } from "react";
import { AlertContent } from "./display/AlertContent";
import { Scoreboard } from "./display/Scoreboard";
import { useAlertTimer } from "./display/useAlertTimer";
import { useScoreboardTimer } from "./display/useScoreboardTimer";

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
  const [showingScoreboard, setShowingScoreboard] = useState(false);

  const handleShowScoreboard = () => {
    console.log('[AlertDisplay] Showing scoreboard for gift alert');
    setShowingScoreboard(true);
  };

  const { completedRef } = useAlertTimer({
    currentAlert,
    onComplete,
    onShowScoreboard: handleShowScoreboard
  });

  useScoreboardTimer({
    showingScoreboard,
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

  console.log('[AlertDisplay] Current state:', {
    currentAlert,
    showingScoreboard,
    isGiftAlert: currentAlert.is_gift_alert
  });

  if (showingScoreboard) {
    console.log('[AlertDisplay] Rendering gift leaderboard');
    return <Scoreboard limit={8} />;
  }

  return (
    <AlertContent
      currentAlert={currentAlert}
      onComplete={onComplete}
      onError={handleImageError}
    />
  );
};