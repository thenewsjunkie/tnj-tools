import { useEffect } from "react";
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
  };
  onComplete: () => void;
}

export const AlertDisplay = ({
  currentAlert,
  onComplete,
}: AlertDisplayProps) => {
  useEffect(() => {
    console.log('[AlertDisplay] Component mounted or alert changed');
    
    if (!currentAlert) {
      console.log('[AlertDisplay] No alert to display');
      return;
    }

    console.log('[AlertDisplay] Setting up media:', currentAlert.media_type);
  }, [currentAlert]);

  const handleImageError = (error: any) => {
    console.error('[AlertDisplay] Image error:', error);
    onComplete();
  };

  if (!currentAlert) {
    console.log('[AlertDisplay] No alert to render');
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      {currentAlert.media_type.startsWith('video') ? (
        <VideoAlert 
          mediaUrl={currentAlert.media_url}
          onComplete={onComplete}
        />
      ) : (
        <ImageAlert 
          mediaUrl={currentAlert.media_url}
          onComplete={onComplete}
          onError={handleImageError}
        />
      )}
      
      {currentAlert.message_enabled && currentAlert.message_text && (
        <AlertMessage 
          message={currentAlert.message_text}
          fontSize={currentAlert.font_size}
        />
      )}
    </div>
  );
};