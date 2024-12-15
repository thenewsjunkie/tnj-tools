import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface AlertDisplayProps {
  currentAlert: {
    media_type: string;
    media_url: string;
    message_enabled?: boolean;
    message_text?: string;
    font_size?: number;
  };
  showPlayButton: boolean;
  setShowPlayButton: (show: boolean) => void;
  onComplete: () => void;
}

export const AlertDisplay = ({
  currentAlert,
  showPlayButton,
  setShowPlayButton,
  onComplete,
}: AlertDisplayProps) => {
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement>(null);

  useEffect(() => {
    console.log('[AlertDisplay] Component mounted with media type:', currentAlert?.media_type);
    
    // For images, trigger completion after a delay
    if (currentAlert?.media_type.startsWith('image')) {
      console.log('[AlertDisplay] Setting up image timer');
      const timer = setTimeout(() => {
        console.log('[AlertDisplay] Image timer completed, triggering onComplete');
        onComplete();
      }, 5000); // Show image for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [currentAlert, onComplete]);

  const handleManualPlay = () => {
    if (mediaRef.current && currentAlert?.media_type.startsWith('video')) {
      console.log('[AlertDisplay] Manual play triggered');
      const videoElement = mediaRef.current as HTMLVideoElement;
      videoElement.play().catch(error => {
        console.error('[AlertDisplay] Error playing video:', error);
      });
      setShowPlayButton(false);
    }
  };

  const handleVideoEnded = () => {
    console.log('[AlertDisplay] Video ended, triggering completion');
    onComplete();
  };

  const handleVideoLoadedMetadata = () => {
    console.log('[AlertDisplay] Video metadata loaded');
    if (mediaRef.current && currentAlert?.media_type.startsWith('video')) {
      const videoElement = mediaRef.current as HTMLVideoElement;
      console.log('[AlertDisplay] Attempting to auto-play video');
      videoElement.play().catch(error => {
        console.log('[AlertDisplay] Auto-play failed, showing play button:', error);
        setShowPlayButton(true);
      });
    }
  };

  if (!currentAlert) {
    console.log('[AlertDisplay] No alert to display');
    return null;
  }

  console.log('[AlertDisplay] Rendering alert with URL:', currentAlert.media_url);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      {currentAlert?.media_type.startsWith('video') ? (
        <>
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={currentAlert.media_url}
            className="max-h-screen max-w-screen-lg"
            onEnded={handleVideoEnded}
            onLoadedMetadata={handleVideoLoadedMetadata}
          />
          {showPlayButton && (
            <Button
              className="absolute"
              size="icon"
              variant="outline"
              onClick={handleManualPlay}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
        </>
      ) : (
        <img
          ref={mediaRef as React.RefObject<HTMLImageElement>}
          src={currentAlert?.media_url}
          alt="Alert"
          className="max-h-screen max-w-screen-lg"
        />
      )}
      {currentAlert?.message_enabled && currentAlert?.message_text && (
        <div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white text-center"
          style={{ 
            fontSize: `${currentAlert.font_size || 24}px`,
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
          }}
        >
          {currentAlert.message_text}
        </div>
      )}
    </div>
  );
};