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
      console.log('[ImageAlert] Image loaded successfully');
      // Don't call onComplete here - let the timer handle it
    }
  };

  const handleImageError = (error: any) => {
    console.error('[ImageAlert] Image error:', error);
    onError(error);
  };

  useEffect(() => {
    console.log('[ImageAlert] Setting up image with URL:', mediaUrl);
    completedRef.current = false;
    
    return () => {
      console.log('[ImageAlert] Cleaning up image');
    };
  }, [mediaUrl]);

  return (
    <img
      src={mediaUrl}
      alt="Alert"
      className="max-h-[70vh] w-auto object-contain"
      onLoad={handleComplete}
      onError={handleImageError}
    />
  );
};

export default ImageAlert;