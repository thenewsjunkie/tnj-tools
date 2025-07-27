import { useRef, useEffect } from "react";

interface SimpleVideoAlertProps {
  mediaUrl: string;
  onComplete: () => void;
  onError?: (error: string) => void;
  onMediaLoaded?: (duration: number) => void;
  repeatCount?: number;
  repeatDelay?: number;
}

const SimpleVideoAlert = ({ 
  mediaUrl, 
  onComplete, 
  onError, 
  onMediaLoaded,
  repeatCount = 1,
  repeatDelay = 0
}: SimpleVideoAlertProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playCountRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      console.log('[SimpleVideoAlert] Video loaded, duration:', video.duration);
      onMediaLoaded?.(video.duration);
      
      // Start playing immediately
      video.play().catch(error => {
        console.error('[SimpleVideoAlert] Play error:', error);
        onError?.(`Failed to play video: ${error.message}`);
      });
    };

    const handleEnded = () => {
      playCountRef.current++;
      console.log('[SimpleVideoAlert] Video ended, play count:', playCountRef.current, 'of', repeatCount);
      
      if (playCountRef.current < repeatCount) {
        // Play again after delay
        setTimeout(() => {
          if (video) {
            video.currentTime = 0;
            video.play();
          }
        }, repeatDelay);
      } else {
        // All repeats done, complete the alert
        console.log('[SimpleVideoAlert] All repeats complete, calling onComplete');
        onComplete();
      }
    };

    const handleError = () => {
      const error = video.error;
      const errorMessage = error ? `Video error: ${error.message}` : 'Unknown video error';
      console.error('[SimpleVideoAlert] Video error:', errorMessage);
      onError?.(errorMessage);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [onComplete, onError, onMediaLoaded, repeatCount, repeatDelay]);

  return (
    <video
      ref={videoRef}
      src={mediaUrl}
      className="max-w-2xl max-h-[80vh] object-contain"
      playsInline
      muted
      controls={false}
      autoPlay={false}
    />
  );
};

export default SimpleVideoAlert;