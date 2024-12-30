import { useEffect, useRef, useState } from "react";
import VideoAlert from "./media/VideoAlert";
import ImageAlert from "./media/ImageAlert";
import AlertMessage from "./AlertMessage";

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
  const completedRef = useRef(false);
  const [showingScoreboard, setShowingScoreboard] = useState(false);

  const handleComplete = () => {
    if (!completedRef.current) {
      if (currentAlert.is_gift_alert) {
        // For gift alerts, show scoreboard before completing
        console.log('[AlertDisplay] Showing scoreboard for gift alert');
        setShowingScoreboard(true);
        // Don't mark as completed yet - wait for scoreboard timer
      } else {
        completedRef.current = true;
        onComplete();
      }
    }
  };

  useEffect(() => {
    console.log('[AlertDisplay] Component mounted or alert changed');
    completedRef.current = false;
    setShowingScoreboard(false);
    
    if (!currentAlert) {
      console.log('[AlertDisplay] No alert to display');
      return;
    }

    console.log('[AlertDisplay] Current alert details:', {
      mediaType: currentAlert.media_type,
      hasMessage: currentAlert.message_enabled,
      messageText: currentAlert.message_text,
      isGiftAlert: currentAlert.is_gift_alert,
      giftCount: currentAlert.gift_count
    });

    // Calculate timeout based on gift count
    let timeout = 15000; // Base timeout of 15 seconds for non-gift alerts
    
    if (currentAlert.is_gift_alert && currentAlert.gift_count) {
      const giftCount = currentAlert.gift_count;
      const baseAnimationSpeed = currentAlert.gift_count_animation_speed || 100;
      
      // Calculate total animation time needed based on gift count
      // Add extra padding time to ensure the animation completes
      const paddingTime = 5000; // Increased padding to 5 seconds
      
      // Simplified timing calculation to ensure consistent counting
      // Each gift takes baseAnimationSpeed milliseconds to count
      const totalAnimationTime = giftCount * baseAnimationSpeed;
      
      // Set timeout to total animation time plus padding
      timeout = totalAnimationTime + paddingTime;
      
      console.log('[AlertDisplay] Gift alert timing details:', {
        giftCount,
        baseAnimationSpeed,
        totalAnimationTime,
        paddingTime,
        finalTimeout: timeout
      });
    }

    const timer = setTimeout(() => {
      console.log('[AlertDisplay] Timer completed, triggering alert end');
      handleComplete();
    }, timeout);
    
    return () => {
      console.log('[AlertDisplay] Cleanup - clearing timer');
      clearTimeout(timer);
    };
  }, [currentAlert, onComplete]);

  // Add a separate effect for handling scoreboard display
  useEffect(() => {
    if (showingScoreboard) {
      console.log('[AlertDisplay] Starting scoreboard display timer');
      const scoreboardTimer = setTimeout(() => {
        console.log('[AlertDisplay] Scoreboard display complete, triggering alert completion');
        completedRef.current = true;
        onComplete();
      }, 5000); // Reduced from 8000 to 5000 for 5 seconds total display time

      return () => clearTimeout(scoreboardTimer);
    }
  }, [showingScoreboard, onComplete]);

  const handleImageError = (error: any) => {
    console.error('[AlertDisplay] Image error:', error);
    handleComplete();
  };

  if (!currentAlert) {
    console.log('[AlertDisplay] No alert to render');
    return null;
  }

  if (showingScoreboard) {
    return (
      <div className="fixed inset-0 bg-black">
        <iframe 
          src="/leaderboard?limit=5"
          className="w-full h-full border-none"
          title="Leaderboard"
        />
      </div>
    );
  }

  const displayMessage = currentAlert.message_enabled && currentAlert.message_text 
    ? currentAlert.message_text
    : '';

  console.log('[AlertDisplay] Rendering with message:', displayMessage);

  return (
    <div className="fixed top-0 left-0 right-0">
      <div className={`flex ${currentAlert.is_gift_alert ? 'items-center gap-8' : 'flex-col items-center'}`}>
        <div>
          {currentAlert.media_type.startsWith('video') ? (
            <VideoAlert 
              mediaUrl={currentAlert.media_url}
              onComplete={handleComplete}
            />
          ) : (
            <ImageAlert 
              mediaUrl={currentAlert.media_url}
              onComplete={handleComplete}
              onError={handleImageError}
            />
          )}
        </div>
        
        {currentAlert.message_enabled && displayMessage && (
          <AlertMessage 
            message={displayMessage}
            fontSize={currentAlert.font_size}
            isGiftAlert={currentAlert.is_gift_alert}
            giftCount={currentAlert.gift_count || 1}
            giftCountAnimationSpeed={currentAlert.gift_count_animation_speed}
            giftTextColor={currentAlert.gift_text_color}
            giftCountColor={currentAlert.gift_count_color}
          />
        )}
      </div>
    </div>
  );
};