import { useRef, useEffect } from "react";

interface VideoAlertProps {
  mediaUrl: string;
  onComplete: () => void;
}

const VideoAlert = ({ mediaUrl, onComplete }: VideoAlertProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);

  const handleComplete = () => {
    if (!completedRef.current) {
      completedRef.current = true;
      console.log('[VideoAlert] Triggering completion callback');
      onComplete();
    }
  };

  useEffect(() => {
    console.log('[VideoAlert] Component mounted');
    completedRef.current = false;
    
    if (videoRef.current) {
      const videoElement = videoRef.current;
      console.log('[VideoAlert] Setting up video element');
      
      videoElement.load();
      videoElement.muted = true;
      videoElement.loop = true; // Make the video loop
      videoElement.play().catch(error => {
        console.error('[VideoAlert] Initial muted autoplay failed:', error);
        // If autoplay fails, trigger completion
        handleComplete();
      });

      videoElement.addEventListener('play', () => {
        console.log('[VideoAlert] Video started playing');
      });

      videoElement.addEventListener('error', (e) => {
        console.error('[VideoAlert] Video error:', e);
        handleComplete();
      });
    }

    return () => {
      if (videoRef.current) {
        console.log('[VideoAlert] Cleaning up video element');
        const videoElement = videoRef.current;
        videoElement.pause();
        videoElement.removeEventListener('play', () => {});
        videoElement.removeEventListener('error', () => {});
      }
    };
  }, [onComplete]);

  const handleVideoLoadedMetadata = () => {
    console.log('[VideoAlert] Video metadata loaded');
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('[VideoAlert] Autoplay after metadata failed:', error);
        handleComplete();
      });
    }
  };

  return (
    <video
      ref={videoRef}
      src={mediaUrl}
      className="max-h-[70vh] w-auto"
      onError={() => handleComplete()}
      onLoadedMetadata={handleVideoLoadedMetadata}
      playsInline
      muted={true}
      controls={false}
      loop={true}
      autoPlay
    />
  );
};

export default VideoAlert;