import React, { useRef, useEffect } from "react";

interface VideoAlertProps {
  mediaUrl: string;
  onComplete: () => void;
  onError: (error: any) => void;
}

const VideoAlert = ({ mediaUrl, onComplete, onError }: VideoAlertProps) => {
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
      videoElement.play().catch(error => {
        console.error('[VideoAlert] Initial muted autoplay failed:', error);
        onError(error);
      });

      videoElement.addEventListener('play', () => {
        console.log('[VideoAlert] Video started playing');
      });

      videoElement.addEventListener('ended', () => {
        console.log('[VideoAlert] Video ended naturally');
        handleComplete();
      });

      videoElement.addEventListener('error', (e) => {
        console.error('[VideoAlert] Video error:', e);
        onError(e);
      });
    }

    return () => {
      if (videoRef.current) {
        console.log('[VideoAlert] Cleaning up video element');
        const videoElement = videoRef.current;
        videoElement.pause();
        videoElement.removeEventListener('play', () => {});
        videoElement.removeEventListener('ended', () => {});
        videoElement.removeEventListener('error', () => {});
      }
    };
  }, [onComplete, onError]);

  const handleVideoLoadedMetadata = () => {
    console.log('[VideoAlert] Video metadata loaded');
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('[VideoAlert] Autoplay after metadata failed:', error);
        onError(error);
      });
    }
  };

  return (
    <video
      ref={videoRef}
      src={mediaUrl}
      className="max-h-[70vh] w-auto"
      onError={() => onError}
      onLoadedMetadata={handleVideoLoadedMetadata}
      playsInline
      muted={true}
      controls={false}
      loop={false}
      autoPlay
    />
  );
};

export default VideoAlert;