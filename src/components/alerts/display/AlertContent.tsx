import React from "react";
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
}

export const AlertContent: React.FC<AlertContentProps> = ({
  currentAlert,
  onComplete,
  onError,
}) => {
  console.log('[AlertContent] Rendering with media:', {
    type: currentAlert.media_type,
    url: currentAlert.media_url
  });

  return (
    <div className="fixed top-0 left-0 right-0">
      <div className={`flex ${currentAlert.is_gift_alert ? 'items-center gap-8' : 'flex-col items-center'}`}>
        <div className="max-w-screen-lg">
          {currentAlert.media_type.startsWith('video') ? (
            <VideoAlert 
              mediaUrl={currentAlert.media_url}
              onComplete={onComplete}
              onError={onError}
            />
          ) : (
            <ImageAlert 
              mediaUrl={currentAlert.media_url}
              onComplete={onComplete}
              onError={onError}
            />
          )}
        </div>
        
        {currentAlert.message_enabled && currentAlert.message_text && (
          <AlertMessage 
            message={currentAlert.message_text}
            fontSize={currentAlert.font_size}
            isGiftAlert={currentAlert.is_gift_alert}
            giftCount={currentAlert.gift_count || 1}
            giftCountAnimationSpeed={currentAlert.gift_count_animation_speed}
            giftTextColor={currentAlert.gift_text_color}
            giftCountColor={currentAlert.gift_count_color}
            onCountComplete={onComplete}
          />
        )}
      </div>
    </div>
  );
};