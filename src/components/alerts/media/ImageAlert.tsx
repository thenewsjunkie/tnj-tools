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
      console.log('[ImageAlert] Image timer completed');
      onComplete();
    }, 5000);
    
    return () => {
      console.log('[ImageAlert] Cleaning up image timer');
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <img
      src={mediaUrl}
      alt="Alert"
      className="max-h-screen max-w-screen-lg"
      onError={onError}
    />
  );
};

export default ImageAlert;