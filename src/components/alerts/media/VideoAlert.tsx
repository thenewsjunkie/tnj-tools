import { useRef, useEffect } from "react";

interface VideoAlertProps {
  mediaUrl: string;
  onComplete: () => void;
}

const VideoAlert = ({ mediaUrl, onComplete }: VideoAlertProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log('[VideoAlert] Component mounted');
    
    if (videoRef.current) {
      const videoElement = videoRef.current;
      console.log('[VideoAlert] Setting up video element');
      
      videoElement.load();
      videoElement.muted = true;
      videoElement.play().catch(error => {
        console.error('[VideoAlert] Initial muted autoplay failed:', error);
      });

      // Add event listeners for debugging
      videoElement.addEventListener('play', () => {
        console.log('[VideoAlert] Video started playing');
      });

      videoElement.addEventListener('ended', () => {
        console.log('[VideoAlert] Video ended naturally');
      });

      videoElement.addEventListener('error', (e) => {
        console.error('[VideoAlert] Video error:', e);
      });
    }

    return () => {
      if (videoRef.current) {
        const videoElement = videoRef.current;
        videoElement.removeEventListener('play', () => {});
        videoElement.removeEventListener('ended', () => {});
        videoElement.removeEventListener('error', () => {});
      }
    };
  }, []);

  const handleVideoLoadedMetadata = () => {
    console.log('[VideoAlert] Video metadata loaded');
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('[VideoAlert] Autoplay after metadata failed:', error);
      });
    }
  };

  const handleVideoEnded = () => {
    console.log('[VideoAlert] Video ended, calling onComplete');
    onComplete();
  };

  const handleVideoError = (error: any) => {
    console.error('[VideoAlert] Video error:', error);
    onComplete();
  };

  return (
    <video
      ref={videoRef}
      src={mediaUrl}
      className="max-h-[70vh] w-auto"
      onEnded={handleVideoEnded}
      onLoadedMetadata={handleVideoLoadedMetadata}
      onError={handleVideoError}
      playsInline
      muted={true}
      controls={false}
      autoPlay
    />
  );
};

export default VideoAlert;