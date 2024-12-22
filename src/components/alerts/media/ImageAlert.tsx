import { useEffect } from "react";

interface ImageAlertProps {
  mediaUrl: string;
  onComplete: () => void;
  onError: (error: any) => void;
}

const ImageAlert = ({ mediaUrl, onComplete, onError }: ImageAlertProps) => {
  useEffect(() => {
    console.log('[ImageAlert] Setting up image timer');
    const timer = setTimeout(() => {
      console.log('[ImageAlert] Image timer completed, calling onComplete');
      onComplete();
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