import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface AlertDisplayProps {
  currentAlert: {
    id: string;
    media_url: string;
    media_type: string;
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
  onComplete
}: AlertDisplayProps) => {
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement>(null);

  const handleManualPlay = () => {
    if (mediaRef.current && currentAlert?.media_type.startsWith('video')) {
      const videoElement = mediaRef.current as HTMLVideoElement;
      videoElement.play().catch(error => {
        console.error('Error playing video:', error);
      });
      setShowPlayButton(false);
    }
  };

  const handleVideoEnded = () => {
    onComplete();
  };

  const renderMessage = () => {
    if (!currentAlert.message_enabled || !currentAlert.message_text) return null;

    const parts = currentAlert.message_text.split(' ');
    const name = parts[0];
    const message = parts.slice(1).join(' ');

    return (
      <div 
        className="absolute bottom-10 w-full text-center"
        style={{
          fontFamily: 'Radiate Sans Extra Bold',
          fontSize: `${currentAlert.font_size}px`,
        }}
      >
        <span className="text-[#31c3a6]">{name}</span>
        {message && <span className="text-white"> {message}</span>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {currentAlert.media_type.startsWith('video') ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={currentAlert.media_url}
            className="w-full h-full object-contain"
            onEnded={handleVideoEnded}
            autoPlay
            playsInline
            muted
          />
        ) : (
          <img
            ref={mediaRef as React.RefObject<HTMLImageElement>}
            src={currentAlert.media_url}
            className="w-full h-full object-contain"
            alt="Alert"
          />
        )}
        {showPlayButton && (
          <Button
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            size="lg"
            onClick={handleManualPlay}
          >
            <Play className="mr-2 h-6 w-6" />
            Play with Sound
          </Button>
        )}
        {renderMessage()}
      </div>
    </div>
  );
};