import { useEffect, useRef } from "react";

interface ImageAlertProps {
  mediaUrl: string;
  onComplete: () => void;
  onError: (error: any) => void;
}

const ImageAlert = ({ mediaUrl, onComplete, onError }: ImageAlertProps) => {
  const completedRef = useRef(false);

  const handleComplete = () => {
    if (!completedRef.current) {
      completedRef.current = true;
      console.log('[ImageAlert] Triggering completion callback');
      onComplete();
    }
  };

  useEffect(() => {
    console.log('[ImageAlert] Setting up image timer');
    completedRef.current = false;
    
    const timer = setTimeout(() => {
      console.log('[ImageAlert] Image timer completed, calling onComplete');
      handleComplete();
    }, 5000);
    
    return () => {
      console.log('[ImageAlert] Cleaning up image timer');
      clearTimeout(timer);
    };
  }, [onComplete]);

  const handleImageLoad = () => {
    console.log('[ImageAlert] Image loaded successfully');
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