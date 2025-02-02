import { useEffect, useRef, useState } from "react";

interface ImageAlertProps {
  mediaUrl: string;
  onComplete: () => void;
  onError: (error: any) => void;
  onMediaLoaded: () => void;
  repeatCount?: number;
}

const ImageAlert = ({ 
  mediaUrl, 
  onComplete, 
  onError, 
  onMediaLoaded,
  repeatCount = 1 
}: ImageAlertProps) => {
  const completedRef = useRef(false);
  const [displayCount, setDisplayCount] = useState(0);

  const handleComplete = () => {
    if (!completedRef.current && displayCount >= repeatCount - 1) {
      completedRef.current = true;
      console.log('[ImageAlert] All repeats completed, triggering completion callback');
      onComplete();
    } else {
      console.log('[ImageAlert] Repeat display', displayCount + 1, 'of', repeatCount);
      setDisplayCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    console.log('[ImageAlert] Setting up image timer');
    completedRef.current = false;
    
    const timer = setTimeout(() => {
      console.log('[ImageAlert] Image timer completed, calling handleComplete');
      handleComplete();
    }, 5000);
    
    return () => {
      console.log('[ImageAlert] Cleaning up image timer');
      clearTimeout(timer);
    };
  }, [displayCount, repeatCount]);

  const handleImageLoad = () => {
    console.log('[ImageAlert] Image loaded successfully');
    onMediaLoaded();
  };

  const handleImageError = (error: any) => {
    console.error('[ImageAlert] Image error:', error);
    handleComplete();
    onError(error);
  };

  return (
    <img
      src={mediaUrl}
      alt="Alert"
      className="max-h-screen max-w-screen-lg"
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  );
};

export default ImageAlert;