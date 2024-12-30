import { useEffect, useRef } from "react";

interface VideoAlertProps {
  mediaUrl: string;
  onComplete: () => void;
  onError: (error: any) => void;
  isGiftAlert?: boolean;
}

const VideoAlert = ({ mediaUrl, onComplete, onError, isGiftAlert }: VideoAlertProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log('[VideoAlert] Component mounted');
    const videoElement = videoRef.current;

    if (!videoElement) return;

    console.log('[VideoAlert] Setting up video element');

    const handlePlay = () => {
      console.log('[VideoAlert] Video started playing');
    };

    const handleLoadedMetadata = () => {
      console.log('[VideoAlert] Video metadata loaded');
    };

    const handleEnded = () => {
      console.log('[VideoAlert] Video ended naturally');
      // Only trigger completion for non-gift alerts
      // Gift alerts will be handled by the useAlertTimer
      if (!isGiftAlert) {
        console.log('[VideoAlert] Non-gift alert - triggering completion callback');
        onComplete();
      } else {
        console.log('[VideoAlert] Gift alert - letting timer handle completion');
      }
    };

    const handleError = (error: any) => {
      console.error('[VideoAlert] Video error:', error);
      onError(error);
    };

    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('error', handleError);

    // Start playing the video
    videoElement.play().catch(handleError);

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('ended', handleEnded);
        videoElement.removeEventListener('error', handleError);
      }
    };
  }, [onComplete, onError, isGiftAlert]);

  return (
    <video
      ref={videoRef}
      src={mediaUrl}
      className="max-w-full h-auto"
      playsInline
      muted={false}
    />
  );
};

export default VideoAlert;