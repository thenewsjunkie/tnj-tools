import React, { useRef, useEffect } from "react";

interface VideoAlertProps {
  mediaUrl: string;
  onComplete: () => void;
  onError: (error: any) => void;
  onMediaLoaded: () => void;
}

const VideoAlert = ({ mediaUrl, onComplete, onError, onMediaLoaded }: VideoAlertProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const completedRef = useRef(false);
  const unmountedRef = useRef(false);
  const playAttemptedRef = useRef(false);

  const handleComplete = () => {
    if (!completedRef.current && !unmountedRef.current) {
      completedRef.current = true;
      console.log('[VideoAlert] Video completed naturally, triggering completion callback');
      onComplete();
    }
  };

  useEffect(() => {
    console.log('[VideoAlert] Setting up video element');
    completedRef.current = false;
    unmountedRef.current = false;
    playAttemptedRef.current = false;
    
    if (videoRef.current) {
      const videoElement = videoRef.current;
      videoElement.load();
      videoElement.muted = true;

      const handlePlay = () => {
        if (!playAttemptedRef.current) {
          console.log('[VideoAlert] Video started playing');
          playAttemptedRef.current = true;
        }
      };

      const handleEnded = () => {
        console.log('[VideoAlert] Video ended naturally');
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
  }, [onComplete, onError]);

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