import React, { useRef, useEffect } from "react";

interface VideoAlertProps {
  mediaUrl: string;
  onComplete: () => void;
  onError: (error: any) => void;
}

const VideoAlert = ({ mediaUrl, onComplete, onError }: VideoAlertProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);
  const unmountedRef = useRef(false);
  const mountCountRef = useRef(0);

  const handleComplete = () => {
    if (!completedRef.current && !unmountedRef.current) {
      completedRef.current = true;
      console.log('[VideoAlert] Video completed, triggering completion callback. Mount count:', mountCountRef.current);
      onComplete();
    } else {
      console.log('[VideoAlert] Skipping duplicate completion. Already completed:', completedRef.current, 'Unmounted:', unmountedRef.current);
    }
  };

  useEffect(() => {
    mountCountRef.current += 1;
    console.log('[VideoAlert] Component mounted. Mount count:', mountCountRef.current);
    completedRef.current = false;
    unmountedRef.current = false;
    
    if (videoRef.current) {
      const videoElement = videoRef.current;
      console.log('[VideoAlert] Setting up video element. Mount count:', mountCountRef.current);
      
      videoElement.load();
      videoElement.muted = true;
      videoElement.play().catch(error => {
        if (!unmountedRef.current) {
          console.error('[VideoAlert] Initial muted autoplay failed:', error);
          onError(error);
        }
      });

      videoElement.addEventListener('play', () => {
        console.log('[VideoAlert] Video started playing. Mount count:', mountCountRef.current);
      });

      videoElement.addEventListener('ended', () => {
        console.log('[VideoAlert] Video ended naturally. Mount count:', mountCountRef.current);
        handleComplete();
      });

      videoElement.addEventListener('error', (e) => {
        if (!unmountedRef.current) {
          console.error('[VideoAlert] Video error:', e);
          onError(e);
        }
      });
    }

    return () => {
      console.log('[VideoAlert] Cleaning up video element. Mount count:', mountCountRef.current);
      unmountedRef.current = true;
      if (videoRef.current) {
        const videoElement = videoRef.current;
        videoElement.pause();
        videoElement.removeEventListener('play', () => {});
        videoElement.removeEventListener('ended', () => {});
        videoElement.removeEventListener('error', () => {});
      }
    };
  }, [onComplete, onError]);

  const handleVideoLoadedMetadata = () => {
    console.log('[VideoAlert] Video metadata loaded. Mount count:', mountCountRef.current);
    if (videoRef.current && !unmountedRef.current) {
      videoRef.current.play().catch(error => {
        if (!unmountedRef.current) {
          console.error('[VideoAlert] Autoplay after metadata failed:', error);
          onError(error);
        }
      });
    }
  };

  return (
    <video
      ref={videoRef}
      src={mediaUrl}
      className="max-h-[70vh] w-auto"
      onError={() => !unmountedRef.current && onError}
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