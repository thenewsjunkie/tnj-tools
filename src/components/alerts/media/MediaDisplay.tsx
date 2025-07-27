import { useEffect } from "react";
import SimpleVideoAlert from "../media/SimpleVideoAlert";
import SimpleImageAlert from "../media/SimpleImageAlert";

interface MediaDisplayProps {
  mediaUrl: string;
  mediaType: string;
  displayDuration?: number;
  repeatCount?: number;
  repeatDelay?: number;
  onComplete: () => void;
  onError?: (error: string) => void;
  onMediaLoaded?: (duration: number) => void;
}

const MediaDisplay = ({ 
  mediaUrl, 
  mediaType, 
  displayDuration = 5,
  repeatCount = 1,
  repeatDelay = 0,
  onComplete, 
  onError, 
  onMediaLoaded 
}: MediaDisplayProps) => {
  
  // Determine actual media type from URL if mediaType is incorrect
  const getActualMediaType = (url: string, declaredType: string): string => {
    const urlLower = url.toLowerCase();
    
    // Check file extension
    if (urlLower.includes('.mp4') || urlLower.includes('.webm') || urlLower.includes('.mov')) {
      return 'video';
    }
    if (urlLower.includes('.jpg') || urlLower.includes('.jpeg') || urlLower.includes('.png') || urlLower.includes('.gif') || urlLower.includes('.webp')) {
      return 'image';
    }
    
    // Fall back to declared type
    return declaredType;
  };

  const actualMediaType = getActualMediaType(mediaUrl, mediaType);

  useEffect(() => {
    console.log('[MediaDisplay] Media details:', {
      url: mediaUrl,
      declaredType: mediaType,
      actualType: actualMediaType,
      displayDuration,
      repeatCount,
      repeatDelay
    });
  }, [mediaUrl, mediaType, actualMediaType, displayDuration, repeatCount, repeatDelay]);

  if (actualMediaType === 'video') {
    return (
      <SimpleVideoAlert
        mediaUrl={mediaUrl}
        onComplete={onComplete}
        onError={onError}
        onMediaLoaded={onMediaLoaded}
        repeatCount={repeatCount}
        repeatDelay={repeatDelay}
      />
    );
  } else {
    return (
      <SimpleImageAlert
        mediaUrl={mediaUrl}
        onComplete={onComplete}
        onError={onError}
        onMediaLoaded={onMediaLoaded}
        displayDuration={displayDuration}
        repeatCount={repeatCount}
        repeatDelay={repeatDelay}
      />
    );
  }
};

export default MediaDisplay;