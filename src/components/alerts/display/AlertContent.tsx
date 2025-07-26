import React, { useState, useCallback, memo, useEffect, useMemo } from "react";
import VideoAlert from "../media/VideoAlert";
import ImageAlert from "../media/ImageAlert";
import AlertMessage from "../AlertMessage";

interface AlertContentProps {
  currentAlert: {
    mediaType: string;
    mediaUrl: string;
    messageEnabled?: boolean;
    messageText?: string;
    fontSize?: number;
    isGiftAlert?: boolean;
    giftCount?: number;
    giftCountAnimationSpeed?: number;
    giftTextColor?: string;
    giftCountColor?: string;
    repeatCount?: number;
    repeatDelay?: number;
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
  const [isCountComplete, setIsCountComplete] = useState(!currentAlert.isGiftAlert);

  useEffect(() => {
    console.log('[AlertContent] Component mounted with alert:', {
      mediaType: currentAlert.mediaType,
      isGiftAlert: currentAlert.isGiftAlert,
      messageEnabled: currentAlert.messageEnabled,
      repeatCount: currentAlert.repeatCount,
      repeatDelay: currentAlert.repeatDelay,
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

  const displayMessage = currentAlert.messageEnabled && currentAlert.messageText 
    ? currentAlert.messageText
    : '';

  // Memoize stable props to prevent unnecessary re-renders
  const stableVideoProps = useMemo(() => ({
    mediaUrl: currentAlert.mediaUrl,
    repeatCount: currentAlert.repeatCount,
    repeatDelay: currentAlert.repeatDelay
  }), [currentAlert.mediaUrl, currentAlert.repeatCount, currentAlert.repeatDelay]);

  const stableImageProps = useMemo(() => ({
    mediaUrl: currentAlert.mediaUrl,
    repeatCount: currentAlert.repeatCount
  }), [currentAlert.mediaUrl, currentAlert.repeatCount]);

  useEffect(() => {
    console.log('[AlertContent] State updated:', {
      isMediaComplete,
      isCountComplete,
      displayMessage: !!displayMessage
    });
  }, [isMediaComplete, isCountComplete, displayMessage]);

  return (
    <div className="fixed top-0 left-0 right-0 flex flex-col items-center">
      <div className="flex flex-col items-center w-full">
        <div className="w-full flex justify-center mb-4">
          {currentAlert.mediaType.startsWith('video') ? (
            <VideoAlert 
              key={`video-${stableVideoProps.mediaUrl}`}
              mediaUrl={stableVideoProps.mediaUrl}
              onComplete={handleComplete}
              onError={onError}
              onMediaLoaded={onMediaLoaded}
              repeatCount={stableVideoProps.repeatCount}
              repeatDelay={stableVideoProps.repeatDelay}
            />
          ) : (
            <ImageAlert 
              key={`image-${stableImageProps.mediaUrl}`}
              mediaUrl={stableImageProps.mediaUrl}
              onComplete={handleComplete}
              onError={onError}
              onMediaLoaded={onMediaLoaded}
              repeatCount={stableImageProps.repeatCount}
            />
          )}
        </div>
        
        {currentAlert.messageEnabled && displayMessage && (
          <div className="w-full mt-2">
            <AlertMessage 
              message={displayMessage}
              fontSize={currentAlert.fontSize}
              isGiftAlert={currentAlert.isGiftAlert}
              giftCount={currentAlert.giftCount || 1}
              giftCountAnimationSpeed={currentAlert.giftCountAnimationSpeed}
              giftTextColor={currentAlert.giftTextColor}
              giftCountColor={currentAlert.giftCountColor}
              onCountComplete={handleCountComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
});

AlertContent.displayName = 'AlertContent';