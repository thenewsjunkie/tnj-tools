import { memo } from "react";
import MediaDisplay from "../media/MediaDisplay";
import AlertMessage from "../AlertMessage";

interface SimpleAlertContentProps {
  currentAlert: {
    id: string;
    mediaUrl: string;
    mediaType: string;
    messageEnabled: boolean;
    messageText?: string;
    username?: string;
    displayDuration?: number;
    repeatCount?: number;
    repeatDelay?: number;
    fontSize?: number;
    textColor?: string;
    giftCount?: number;
    isGiftAlert?: boolean;
    giftCountAnimationSpeed?: number;
    giftTextColor?: string;
    giftCountColor?: string;
  };
  onComplete: () => void;
  onError?: (error: string) => void;
  onMediaLoaded?: (duration: number) => void;
}

const SimpleAlertContent = memo(({ 
  currentAlert, 
  onComplete, 
  onError, 
  onMediaLoaded 
}: SimpleAlertContentProps) => {
  console.log('[SimpleAlertContent] Rendering alert:', currentAlert.id);

  const renderMedia = () => {
    return (
      <MediaDisplay
        mediaUrl={currentAlert.mediaUrl}
        mediaType={currentAlert.mediaType}
        displayDuration={currentAlert.displayDuration || 5}
        repeatCount={currentAlert.repeatCount || 1}
        repeatDelay={currentAlert.repeatDelay || 0}
        onComplete={onComplete}
        onError={onError}
        onMediaLoaded={onMediaLoaded}
      />
    );
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative max-w-2xl max-h-[80vh]">
        {renderMedia()}
        
        {currentAlert.messageEnabled && currentAlert.messageText && (
          <AlertMessage
            message={currentAlert.messageText}
            username={currentAlert.username}
            fontSize={currentAlert.fontSize || 24}
            isGiftAlert={currentAlert.isGiftAlert}
            giftCount={currentAlert.giftCount}
            giftCountAnimationSpeed={currentAlert.giftCountAnimationSpeed}
            giftTextColor={currentAlert.giftTextColor}
            giftCountColor={currentAlert.giftCountColor}
          />
        )}
      </div>
    </div>
  );
});

SimpleAlertContent.displayName = 'SimpleAlertContent';

export default SimpleAlertContent;