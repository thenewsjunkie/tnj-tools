import { useEffect } from "react";

interface SimpleImageAlertProps {
  mediaUrl: string;
  onComplete: () => void;
  onError?: (error: string) => void;
  onMediaLoaded?: (duration: number) => void;
  displayDuration?: number;
  repeatCount?: number;
  repeatDelay?: number;
}

const SimpleImageAlert = ({ 
  mediaUrl, 
  onComplete, 
  onError, 
  onMediaLoaded,
  displayDuration = 5,
  repeatCount = 1,
  repeatDelay = 0
}: SimpleImageAlertProps) => {

  useEffect(() => {
    console.log('[SimpleImageAlert] Starting image display');
    
    // Calculate total duration including repeats
    const totalDuration = (displayDuration * repeatCount) + (repeatDelay * (repeatCount - 1));
    
    // Notify that media is loaded
    onMediaLoaded?.(displayDuration);
    
    // Set timer for completion
    const timer = setTimeout(() => {
      console.log('[SimpleImageAlert] Display duration complete, calling onComplete');
      onComplete();
    }, totalDuration * 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [onComplete, onMediaLoaded, displayDuration, repeatCount, repeatDelay]);

  const handleImageError = () => {
    console.error('[SimpleImageAlert] Image failed to load:', mediaUrl);
    onError?.('Failed to load image');
  };

  return (
    <img
      src={mediaUrl}
      alt="Alert"
      className="w-full h-full object-cover"
      onError={handleImageError}
    />
  );
};

export default SimpleImageAlert;