import { useEffect, useRef, useState } from "react";
import { alertLogger } from "@/utils/alertLogger";

interface VideoAlertProps {
  mediaUrl: string;
  onComplete: () => void;
  onError: (error: any) => void;
  onMediaLoaded: () => void;
  repeatCount?: number;
  repeatDelay?: number;
}

const VideoAlert = ({
  mediaUrl,
  onComplete,
  onError,
  onMediaLoaded,
  repeatCount = 1,
  repeatDelay = 1000
}: VideoAlertProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playCount, setPlayCount] = useState(0);
  const mountCountRef = useRef(0);

  useEffect(() => {
    mountCountRef.current += 1;
    alertLogger.videoAlert('Component mounted. Mount count:', mountCountRef.current);
    
    const video = videoRef.current;
    if (!video) return;

    alertLogger.videoAlert('Setting up video element');

    const handleLoadedMetadata = () => {
      alertLogger.videoAlert('Video metadata loaded');
      alertLogger.videoAlert('Video duration:', video.duration);
      onMediaLoaded();
      video.play().catch(onError);
    };

    const handleEnded = () => {
      alertLogger.videoAlert('Video ended, play count:', playCount);
      setPlayCount(prev => {
        if (prev + 1 >= repeatCount) {
          alertLogger.videoAlert('All repeats completed, triggering completion callback');
          onComplete();
          return prev;
        }
        
        setTimeout(() => {
          if (video) {
            video.currentTime = 0;
            video.play().catch(onError);
          }
        }, repeatDelay);
        
        return prev + 1;
      });
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', onError);
    video.addEventListener('play', () => alertLogger.videoAlert('Video started playing'));

    return () => {
      alertLogger.videoAlert('Cleaning up video element');
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', onError);
    };
  }, [mediaUrl, onComplete, onError, onMediaLoaded, playCount, repeatCount, repeatDelay]);

  return (
    <video
      ref={videoRef}
      src={mediaUrl}
      className="max-h-[70vh] w-auto"
      playsInline
    />
  );
};

export default VideoAlert;