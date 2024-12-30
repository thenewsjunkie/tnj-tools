import { useEffect, useRef } from "react";
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

  const handleComplete = () => {
    if (!completedRef.current) {
      completedRef.current = true;
      console.log('[AlertDisplay] Triggering completion callback');
      onComplete();
    }
  };

  useEffect(() => {
    console.log('[AlertDisplay] Component mounted or alert changed');
    completedRef.current = false;
    
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
      const paddingTime = 3000; // 3 seconds padding
      
      // Progressive scaling for different ranges of gift counts
      let totalAnimationTime = 0;
      
      if (giftCount <= 30) {
        totalAnimationTime = giftCount * baseAnimationSpeed;
      } else if (giftCount <= 50) {
        totalAnimationTime = (30 * baseAnimationSpeed) + 
                           ((giftCount - 30) * (baseAnimationSpeed * 0.8));
      } else if (giftCount <= 100) {
        totalAnimationTime = (30 * baseAnimationSpeed) + 
                           (20 * (baseAnimationSpeed * 0.8)) +
                           ((giftCount - 50) * (baseAnimationSpeed * 0.6));
      } else {
        totalAnimationTime = (30 * baseAnimationSpeed) + 
                           (20 * (baseAnimationSpeed * 0.8)) +
                           (50 * (baseAnimationSpeed * 0.6)) +
                           ((giftCount - 100) * (baseAnimationSpeed * 0.4));
      }
      
      // Set timeout to total animation time plus padding
      timeout = totalAnimationTime + paddingTime;
      
      // Remove the 60-second cap to ensure all gifts are counted
      console.log('[AlertDisplay] Calculated timeout for gift alert:', timeout, 'ms');
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

  const handleImageError = (error: any) => {
    console.error('[AlertDisplay] Image error:', error);
    handleComplete();
  };

  if (!currentAlert) {
    console.log('[AlertDisplay] No alert to render');
    return null;
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