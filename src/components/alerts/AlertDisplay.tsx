import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AlertDisplayProps {
  currentAlert: {
    id: string;
    alert: {
      id: string;
      title: string;
      media_url: string;
      media_type: string;
      message_enabled: boolean;
      message_text?: string;
      display_duration?: number;
      repeat_count?: number;
      repeat_delay?: number;
      font_size?: number;
      text_color?: string;
      is_gift_alert?: boolean;
      gift_count_animation_speed?: number;
      gift_text_color?: string;
      gift_count_color?: string;
    };
    username?: string;
    gift_count?: number;
  };
}

const AlertDisplay = ({ currentAlert }: AlertDisplayProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement>(null);
  const completionTimeoutRef = useRef<NodeJS.Timeout>();
  const repeatTimeoutRef = useRef<NodeJS.Timeout>();
  const failsafeTimeoutRef = useRef<NodeJS.Timeout>();

  // Determine actual media type from URL
  const getActualMediaType = (url: string): 'video' | 'image' => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext)) ? 'video' : 'image';
  };

  const actualMediaType = getActualMediaType(currentAlert.alert.media_url);
  const displayDuration = (currentAlert.alert.display_duration || 5) * 1000;
  const repeatCount = currentAlert.alert.repeat_count || 1;
  const repeatDelay = currentAlert.alert.repeat_delay || 0;

  const handleComplete = async () => {
    if (isCompleting) {
      console.log('[AlertDisplay] Already completing, ignoring duplicate call');
      return;
    }
    
    setIsCompleting(true);
    console.log('[AlertDisplay] STARTING COMPLETION for alert:', currentAlert.id);

    // Clear ALL timers immediately
    [completionTimeoutRef, repeatTimeoutRef, failsafeTimeoutRef].forEach(ref => {
      if (ref.current) {
        clearTimeout(ref.current);
        ref.current = undefined;
      }
    });

    try {
      console.log('[AlertDisplay] Updating database to completed...');
      const { error } = await supabase
        .from('alert_queue')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', currentAlert.id)
        .eq('status', 'playing');

      if (error) {
        console.error('[AlertDisplay] Database error completing alert:', error);
      } else {
        console.log('[AlertDisplay] ✅ Alert marked as completed in database');
      }
    } catch (error) {
      console.error('[AlertDisplay] Exception completing alert:', error);
    }
  };

  const handleMediaLoaded = () => {
    console.log('[AlertDisplay] Media loaded, repeat:', currentRepeat + 1, 'of', repeatCount);
    
    // Clear any existing timeouts
    [completionTimeoutRef, repeatTimeoutRef].forEach(ref => {
      if (ref.current) {
        clearTimeout(ref.current);
        ref.current = undefined;
      }
    });

    // Only set timeout for images, videos will use 'ended' event
    if (actualMediaType === 'image') {
      completionTimeoutRef.current = setTimeout(() => {
        console.log('[AlertDisplay] Image timeout triggered for repeat:', currentRepeat + 1);
        handleMediaComplete();
      }, displayDuration);
    }
  };

  const handleVideoEnded = () => {
    console.log('[AlertDisplay] 🎬 Video ended event for repeat:', currentRepeat + 1, 'of', repeatCount);
    handleMediaComplete();
  };

  const handleMediaComplete = () => {
    if (isCompleting) {
      console.log('[AlertDisplay] Already completing, ignoring media complete');
      return;
    }
    
    const nextRepeat = currentRepeat + 1;
    console.log('[AlertDisplay] 🔄 Media complete. Repeat:', nextRepeat, 'of', repeatCount);
    
    if (nextRepeat < repeatCount) {
      console.log('[AlertDisplay] ⏭️ Starting repeat', nextRepeat + 1, 'after delay:', repeatDelay);
      setCurrentRepeat(nextRepeat);
      
      if (repeatDelay > 0) {
        repeatTimeoutRef.current = setTimeout(() => {
          if (!isCompleting) {
            restartMedia();
          }
        }, repeatDelay);
      } else {
        restartMedia();
      }
    } else {
      console.log('[AlertDisplay] 🏁 ALL REPEATS COMPLETE! Triggering completion...');
      // Force completion immediately - no delay
      handleComplete();
    }
  };

  const restartMedia = () => {
    if (isCompleting) return; // Don't restart if completing
    
    console.log('[AlertDisplay] Restarting media for repeat:', currentRepeat + 1);
    
    if (mediaRef.current) {
      if (actualMediaType === 'video') {
        const video = mediaRef.current as HTMLVideoElement;
        video.currentTime = 0;
        
        // Add user interaction check for video restart
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn('[AlertDisplay] Video restart blocked by browser:', error.message);
            console.log('[AlertDisplay] Attempting to complete due to video restart failure');
            handleComplete();
          });
        }
      } else {
        // For images, just restart the timer
        handleMediaLoaded();
      }
    }
  };

  useEffect(() => {
    console.log('[AlertDisplay] 🚀 Alert mounted:', currentAlert.id, 'Type:', actualMediaType, 'Repeats:', repeatCount);
    setIsCompleting(false);
    setCurrentRepeat(0);
    
    // Set a failsafe timeout - if nothing completes the alert in reasonable time, force completion
    const totalExpectedDuration = (displayDuration + repeatDelay) * repeatCount + 5000; // 5s buffer
    failsafeTimeoutRef.current = setTimeout(() => {
      console.log('[AlertDisplay] ⚠️ FAILSAFE TIMEOUT - Force completing stuck alert');
      handleComplete();
    }, totalExpectedDuration);
    
    return () => {
      console.log('[AlertDisplay] 🧹 Alert unmounted:', currentAlert.id);
      [completionTimeoutRef, repeatTimeoutRef, failsafeTimeoutRef].forEach(ref => {
        if (ref.current) {
          clearTimeout(ref.current);
          ref.current = undefined;
        }
      });
    };
  }, [currentAlert.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
      <div className="relative max-w-2xl max-h-[80vh]">
        {actualMediaType === 'video' ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={currentAlert.alert.media_url}
            autoPlay
            muted
            playsInline
            onLoadedData={handleMediaLoaded}
            onEnded={handleVideoEnded}
            onError={() => {
              console.error('[AlertDisplay] Video error, completing alert');
              handleComplete();
            }}
            className="max-w-full max-h-full object-contain"
            style={{ width: 'auto', height: 'auto' }}
          />
        ) : (
          <img
            ref={mediaRef as React.RefObject<HTMLImageElement>}
            src={currentAlert.alert.media_url}
            onLoad={handleMediaLoaded}
            onError={() => handleComplete()}
            alt={currentAlert.alert.title}
            className="max-w-full max-h-full object-contain"
            style={{ width: 'auto', height: 'auto' }}
          />
        )}
        
        {currentAlert.alert.message_enabled && currentAlert.alert.message_text && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white p-4 rounded">
            <p 
              style={{ 
                fontSize: `${currentAlert.alert.font_size || 24}px`,
                color: currentAlert.alert.text_color || '#FFFFFF'
              }}
            >
              {currentAlert.username && `${decodeURIComponent(currentAlert.username)} `}
              {currentAlert.alert.message_text}
              {currentAlert.alert.is_gift_alert && currentAlert.gift_count && (
                <span 
                  style={{ 
                    color: currentAlert.alert.gift_count_color || '#4CDBC4',
                    marginLeft: '8px'
                  }}
                >
                  x{currentAlert.gift_count}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertDisplay;