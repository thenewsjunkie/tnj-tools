import { memo } from "react";
import SimpleVideoAlert from "../media/SimpleVideoAlert";
import SimpleImageAlert from "../media/SimpleImageAlert";
import AlertMessage from "../AlertMessage";

interface SimpleAlertContentProps {
  currentAlert: {
    id: string;
    mediaUrl: string;
    mediaType: string;
    messageEnabled: boolean;
    messageText?: string;
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
    if (currentAlert.mediaType === 'video') {
      return (
        <SimpleVideoAlert
          mediaUrl={currentAlert.mediaUrl}
          onComplete={onComplete}
          onError={onError}
          onMediaLoaded={onMediaLoaded}
          repeatCount={currentAlert.repeatCount || 1}
          repeatDelay={currentAlert.repeatDelay || 0}
        />
      );
    } else {
      return (
        <SimpleImageAlert
          mediaUrl={currentAlert.mediaUrl}
          onComplete={onComplete}
          onError={onError}
          onMediaLoaded={onMediaLoaded}
          displayDuration={currentAlert.displayDuration || 5}
          repeatCount={currentAlert.repeatCount || 1}
          repeatDelay={currentAlert.repeatDelay || 0}
        />
      );
    }
  };

  return (
    <div className="relative w-full h-full">
      {renderMedia()}
      
      {currentAlert.messageEnabled && currentAlert.messageText && (
        <AlertMessage
          message={currentAlert.messageText}
          fontSize={currentAlert.fontSize || 24}
          isGiftAlert={currentAlert.isGiftAlert}
          giftCount={currentAlert.giftCount}
          giftCountAnimationSpeed={currentAlert.giftCountAnimationSpeed}
          giftTextColor={currentAlert.giftTextColor}
          giftCountColor={currentAlert.giftCountColor}
        />
      )}
    </div>
  );
});

SimpleAlertContent.displayName = 'SimpleAlertContent';

export default SimpleAlertContent;