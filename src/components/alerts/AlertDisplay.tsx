import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Volume2, VolumeX } from "lucide-react";

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
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    console.log('[AlertDisplay] Component mounted or alert changed');
    
    if (!currentAlert) {
      console.log('[AlertDisplay] No alert to display');
      return;
    }

    console.log('[AlertDisplay] Setting up media:', currentAlert.media_type);
    
    // For images, trigger completion after a delay
    if (currentAlert.media_type.startsWith('image')) {
      console.log('[AlertDisplay] Setting up image timer');
      const timer = setTimeout(() => {
        console.log('[AlertDisplay] Image timer completed');
        onComplete();
      }, 5000);
      
      return () => {
        console.log('[AlertDisplay] Cleaning up image timer');
        clearTimeout(timer);
      };
    }

    // For videos, set up the video element
    if (currentAlert.media_type.startsWith('video') && mediaRef.current) {
      const videoElement = mediaRef.current as HTMLVideoElement;
      console.log('[AlertDisplay] Setting up video element');
      
      // Load and attempt to play muted first
      videoElement.load();
      videoElement.muted = true;
      videoElement.play().catch(error => {
        console.log('[AlertDisplay] Initial muted autoplay failed:', error);
        setShowPlayButton(true);
      });
    }
  }, [currentAlert, onComplete, setShowPlayButton]);

  const handleManualPlay = () => {
    if (mediaRef.current && currentAlert?.media_type.startsWith('video')) {
      console.log('[AlertDisplay] Manual play triggered');
      const videoElement = mediaRef.current as HTMLVideoElement;
      videoElement.play().catch(error => {
        console.error('[AlertDisplay] Manual play failed:', error);
      });
      setShowPlayButton(false);
    }
  };

  const toggleMute = () => {
    if (mediaRef.current && currentAlert?.media_type.startsWith('video')) {
      const videoElement = mediaRef.current as HTMLVideoElement;
      videoElement.muted = !videoElement.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoEnded = () => {
    console.log('[AlertDisplay] Video ended');
    onComplete();
  };

  const handleVideoLoadedMetadata = () => {
    console.log('[AlertDisplay] Video metadata loaded');
    if (mediaRef.current && currentAlert?.media_type.startsWith('video')) {
      const videoElement = mediaRef.current as HTMLVideoElement;
      videoElement.play().catch(error => {
        console.log('[AlertDisplay] Autoplay after metadata failed:', error);
        setShowPlayButton(true);
      });
    }
  };

  const handleVideoError = (error: any) => {
    console.error('[AlertDisplay] Video error:', error);
    onComplete(); // Complete the alert if video fails
  };

  const handleImageError = (error: any) => {
    console.error('[AlertDisplay] Image error:', error);
    onComplete(); // Complete the alert if image fails
  };

  if (!currentAlert) {
    console.log('[AlertDisplay] No alert to render');
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      {currentAlert.media_type.startsWith('video') ? (
        <>
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={currentAlert.media_url}
            className="max-h-screen max-w-screen-lg"
            onEnded={handleVideoEnded}
            onLoadedMetadata={handleVideoLoadedMetadata}
            onError={handleVideoError}
            playsInline
            muted={isMuted}
            controls={false}
            autoPlay
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <Button
              size="icon"
              variant="outline"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </>
      ) : (
        <img
          ref={mediaRef as React.RefObject<HTMLImageElement>}
          src={currentAlert.media_url}
          alt="Alert"
          className="max-h-screen max-w-screen-lg"
          onError={handleImageError}
        />
      )}
      {currentAlert.message_enabled && currentAlert.message_text && (
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