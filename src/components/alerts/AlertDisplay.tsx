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
    // For images, trigger completion after a delay
    if (currentAlert?.media_type.startsWith('image')) {
      console.log('Setting up image timer');
      const timer = setTimeout(() => {
        console.log('Image timer completed');
        onComplete();
      }, 5000); // Show image for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [currentAlert, onComplete]);

  const handleManualPlay = () => {
    if (mediaRef.current && currentAlert?.media_type.startsWith('video')) {
      const videoElement = mediaRef.current as HTMLVideoElement;
      videoElement.play();
      setShowPlayButton(false);
    }
  };

  const handleVideoEnded = () => {
    console.log('Video ended, triggering completion');
    onComplete();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      {currentAlert?.media_type.startsWith('video') ? (
        <>
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={currentAlert.media_url}
            className="max-h-screen max-w-screen-lg"
            onEnded={handleVideoEnded}
            onLoadedMetadata={() => setShowPlayButton(true)}
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