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
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement>(null);
  const completionTimerRef = useRef<NodeJS.Timeout>();
  const heartbeatRef = useRef<NodeJS.Timeout>();

  // Determine actual media type from URL
  const getActualMediaType = (url: string): 'video' | 'image' => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext)) ? 'video' : 'image';
  };

  const actualMediaType = getActualMediaType(currentAlert.alert.media_url);
  const displayDuration = (currentAlert.alert.display_duration || 5) * 1000;

  const clearAllTimers = () => {
    console.log('[AlertDisplay] Clearing all timers');
    
    if (completionTimerRef.current) {
      clearTimeout(completionTimerRef.current);
      completionTimerRef.current = undefined;
    }
    
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = undefined;
    }
  };

  const handleComplete = async () => {
    if (isCompleting) {
      console.log('[AlertDisplay] Already completing, ignoring duplicate call');
      return;
    }
    
    setIsCompleting(true);
    console.log('[AlertDisplay] 🏁 COMPLETING alert:', currentAlert.id);

    // Clear all timers immediately
    clearAllTimers();

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

  const startAlertTimer = (duration: number) => {
    console.log('[AlertDisplay] ⏰ Starting alert timer for:', duration + 'ms');
    
    // Use requestAnimationFrame for better reliability in background tabs
    const startTime = performance.now();
    
    const checkCompletion = () => {
      const elapsed = performance.now() - startTime;
      
      if (elapsed >= duration) {
        console.log('[AlertDisplay] ⏰ Timer completed, finishing alert');
        handleComplete();
      } else {
        // Check again in 100ms for more precision
        completionTimerRef.current = setTimeout(checkCompletion, 100);
      }
    };
    
    checkCompletion();
  };

  const startHeartbeat = () => {
    const sendHeartbeat = async () => {
      try {
        await supabase
          .from('alert_queue')
          .update({ last_heartbeat: new Date().toISOString() })
          .eq('id', currentAlert.id)
          .eq('status', 'playing');
        
        console.log('[AlertDisplay] 💓 Heartbeat sent');
      } catch (error) {
        console.error('[AlertDisplay] Heartbeat error:', error);
      }
    };
    
    // Send initial heartbeat
    sendHeartbeat();
    
    // Set up periodic heartbeat every 2 seconds
    heartbeatRef.current = setInterval(sendHeartbeat, 2000);
  };

  useEffect(() => {
    console.log('[AlertDisplay] 🚀 Alert mounted:', currentAlert.id, 'Type:', actualMediaType);
    setIsCompleting(false);
    
    // Start heartbeat immediately
    startHeartbeat();
    
    if (actualMediaType === 'image') {
      // For images, use display duration immediately
      console.log('[AlertDisplay] 🖼️ Image alert, duration:', displayDuration + 'ms');
      startAlertTimer(displayDuration);
    } else {
      // For videos, try to get actual duration first, fallback to display duration
      const video = mediaRef.current as HTMLVideoElement;
      
      const handleLoadedMetadata = () => {
        if (video && video.duration) {
          const videoDuration = video.duration * 1000;
          console.log('[AlertDisplay] 📹 Video duration:', videoDuration + 'ms');
          startAlertTimer(videoDuration);
        } else {
          console.log('[AlertDisplay] 📹 No video duration, using fallback:', displayDuration + 'ms');
          startAlertTimer(displayDuration);
        }
      };

      if (video) {
        if (video.duration) {
          handleLoadedMetadata();
        } else {
          video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
          // Fallback timer in case metadata never loads
          setTimeout(() => {
            if (!completionTimerRef.current) {
              console.log('[AlertDisplay] 📹 Metadata timeout, using fallback duration');
              startAlertTimer(displayDuration);
            }
          }, 1000);
        }
      }
    }
    
    return () => {
      console.log('[AlertDisplay] 🧹 Alert unmounted:', currentAlert.id);
      clearAllTimers();
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
            loop={false}
            onError={() => {
              console.error('[AlertDisplay] Video error, using fallback duration');
              if (!completionTimerRef.current) {
                startAlertTimer(displayDuration);
              }
            }}
            className="max-w-full max-h-full object-contain"
            style={{ width: 'auto', height: 'auto' }}
          />
        ) : (
          <img
            ref={mediaRef as React.RefObject<HTMLImageElement>}
            src={currentAlert.alert.media_url}
            onError={() => {
              console.error('[AlertDisplay] Image error, completing alert');
              handleComplete();
            }}
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