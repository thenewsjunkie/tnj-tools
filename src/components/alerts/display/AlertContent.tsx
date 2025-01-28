import React, { useState, useCallback, memo, useEffect } from "react";
import VideoAlert from "../media/VideoAlert";
import ImageAlert from "../media/ImageAlert";
import AlertMessage from "../AlertMessage";

interface AlertContentProps {
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
  onError: (error: any) => void;
  onMediaLoaded: () => void;
}

export const AlertContent: React.FC<AlertContentProps> = memo(({
  currentAlert,
  onComplete,
  onError,
  onMediaLoaded
}) => {
  const [isMediaComplete, setIsMediaComplete] = useState(false);
  const [isCountComplete, setIsCountComplete] = useState(!currentAlert.is_gift_alert);

  useEffect(() => {
    console.log('[AlertContent] Component mounted with alert:', {
      mediaType: currentAlert.media_type,
      isGiftAlert: currentAlert.is_gift_alert,
      messageEnabled: currentAlert.message_enabled,
      isMediaComplete,
      isCountComplete
    });

    return () => {
      console.log('[AlertContent] Component unmounting');
    };
  }, [currentAlert, isMediaComplete, isCountComplete]);

  const handleComplete = useCallback(() => {
    console.log('[AlertContent] Media completed');
    setIsMediaComplete(true);
    if (isCountComplete) {
      console.log('[AlertContent] Both media and count complete, triggering onComplete');
      onComplete();
    }
  }, [isCountComplete, onComplete]);

  const handleCountComplete = useCallback(() => {
    console.log('[AlertContent] Count animation completed');
    setIsCountComplete(true);
    if (isMediaComplete) {
      console.log('[AlertContent] Both media and count complete, triggering onComplete');
      onComplete();
    }
  }, [isMediaComplete, onComplete]);

  const displayMessage = currentAlert.message_enabled && currentAlert.message_text 
    ? currentAlert.message_text
    : '';

  useEffect(() => {
    console.log('[AlertContent] State updated:', {
      isMediaComplete,
      isCountComplete,
      displayMessage: !!displayMessage
    });
  }, [isMediaComplete, isCountComplete, displayMessage]);

  return (
    <div className="fixed top-0 left-0 right-0 flex flex-col items-center">
      <div className={`${currentAlert.is_gift_alert ? 'flex items-center justify-between w-full px-8' : 'flex flex-col items-center'}`}>
        <div className="mb-2">
          {currentAlert.media_type.startsWith('video') ? (
            <VideoAlert 
              mediaUrl={currentAlert.media_url}
              onComplete={handleComplete}
              onError={onError}
              onMediaLoaded={onMediaLoaded}
            />
          ) : (
            <ImageAlert 
              mediaUrl={currentAlert.media_url}
              onComplete={handleComplete}
              onError={onError}
              onMediaLoaded={onMediaLoaded}
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
            onCountComplete={handleCountComplete}
          />
        )}
      </div>
    </div>
  );
});

AlertContent.displayName = 'AlertContent';