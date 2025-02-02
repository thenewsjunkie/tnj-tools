import React, { useRef, useEffect, useState } from "react";

interface VideoAlertProps {
  mediaUrl: string;
  onComplete: () => void;
  onError: (error: any) => void;
  onMediaLoaded: () => void;
  repeatCount?: number;
}

const VideoAlert = ({ 
  mediaUrl, 
  onComplete, 
  onError, 
  onMediaLoaded,
  repeatCount = 1
}: VideoAlertProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);
  const unmountedRef = useRef(false);
  const mountCountRef = useRef(0);
  const playAttemptedRef = useRef(false);
  const [playCount, setPlayCount] = useState(0);

  const handleComplete = () => {
    if (!completedRef.current && !unmountedRef.current && playCount >= repeatCount - 1) {
      completedRef.current = true;
      console.log('[VideoAlert] All repeats completed, triggering completion callback');
      onComplete();
    } else if (!unmountedRef.current) {
      console.log('[VideoAlert] Repeat play', playCount + 1, 'of', repeatCount);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
        setPlayCount(prev => prev + 1);
      }
    }
  };

  useEffect(() => {
    mountCountRef.current += 1;
    console.log('[VideoAlert] Component mounted. Mount count:', mountCountRef.current);
    completedRef.current = false;
    unmountedRef.current = false;
    playAttemptedRef.current = false;
    
    if (videoRef.current) {
      const videoElement = videoRef.current;
      console.log('[VideoAlert] Setting up video element');
      
      videoElement.load();
      videoElement.muted = true;

      const handlePlay = () => {
        console.log('[VideoAlert] Video started playing');
        playAttemptedRef.current = true;
      };

      const handleEnded = () => {
        console.log('[VideoAlert] Video ended, play count:', playCount);
        handleComplete();
      };

      const handleError = (e: Event) => {
        if (!unmountedRef.current) {
          console.error('[VideoAlert] Video error:', e);
          onError(e);
        }
      };

      videoElement.addEventListener('play', handlePlay);
      videoElement.addEventListener('ended', handleEnded);
      videoElement.addEventListener('error', handleError);

      return () => {
        console.log('[VideoAlert] Cleaning up video element');
        unmountedRef.current = true;
        if (!completedRef.current) {
          videoElement.pause();
        }
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('ended', handleEnded);
        videoElement.removeEventListener('error', handleError);
      };
    }
  }, [onComplete, onError, playCount, repeatCount]);

  const handleVideoLoadedMetadata = async () => {
    console.log('[VideoAlert] Video metadata loaded');
    if (videoRef.current && !unmountedRef.current && !playAttemptedRef.current) {
      onMediaLoaded();
      try {
        await videoRef.current.play();
      } catch (error) {
        if (!unmountedRef.current) {
          console.error('[VideoAlert] Autoplay failed:', error);
          onError(error);
        }
      }
    }
  };

  return (
    <video
      ref={videoRef}
      src={mediaUrl}
      className="max-h-[70vh] w-auto"
      onError={(e) => !unmountedRef.current && onError(e)}
      onLoadedMetadata={handleVideoLoadedMetadata}
      playsInline
      muted={true}
      controls={false}
      loop={false}
    />
  );
};

export default VideoAlert;