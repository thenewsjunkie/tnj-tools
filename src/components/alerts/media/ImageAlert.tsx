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
      console.log('[ImageAlert] Image loaded successfully:', mediaUrl);
    }
  };

  const handleImageError = (error: any) => {
    console.error('[ImageAlert] Image error:', error);
    console.error('[ImageAlert] Failed to load image URL:', mediaUrl);
    onError({
      message: 'Failed to load image',
      url: mediaUrl,
      error
    });
  };

  useEffect(() => {
    console.log('[ImageAlert] Setting up image with URL:', mediaUrl);
    completedRef.current = false;
    
    // Preload the image
    const img = new Image();
    img.src = mediaUrl;
    img.onload = handleComplete;
    img.onerror = () => handleImageError(new Error('Image failed to load'));
    
    return () => {
      console.log('[ImageAlert] Cleaning up image');
      img.onload = null;
      img.onerror = null;
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