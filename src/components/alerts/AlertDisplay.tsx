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

    const backupTimer = setTimeout(() => {
      console.log('[AlertDisplay] Backup timer triggered - forcing completion');
      handleComplete();
    }, 15000);
    
    return () => {
      console.log('[AlertDisplay] Component cleanup - clearing backup timer');
      clearTimeout(backupTimer);
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