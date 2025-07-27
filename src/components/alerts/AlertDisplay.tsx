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
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [alertStartTime] = useState(Date.now());
  const [timerSystemSetup, setTimerSystemSetup] = useState(false);
  
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement>(null);
  const alertTimersRef = useRef<NodeJS.Timeout[]>([]);
  const heartbeatRef = useRef<NodeJS.Timeout>();
  const durationDetectionRef = useRef<NodeJS.Timeout>();

  // Determine actual media type from URL
  const getActualMediaType = (url: string): 'video' | 'image' => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some(ext => lowerUrl.includes(ext)) ? 'video' : 'image';
  };

  const actualMediaType = getActualMediaType(currentAlert.alert.media_url);
  const displayDuration = (currentAlert.alert.display_duration || 5) * 1000;
  const repeatCount = currentAlert.alert.repeat_count || 1;
  const repeatDelay = (currentAlert.alert.repeat_delay || 0) * 1000;

  const clearAllTimers = () => {
    console.log('[AlertDisplay] Clearing all timers');
    
    // Clear all alert timers
    alertTimersRef.current.forEach(timer => clearTimeout(timer));
    alertTimersRef.current = [];
    
    // Clear heartbeat
    if (heartbeatRef.current) {
      clearTimeout(heartbeatRef.current);
      heartbeatRef.current = undefined;
    }
    
    // Clear duration detection
    if (durationDetectionRef.current) {
      clearTimeout(durationDetectionRef.current);
      durationDetectionRef.current = undefined;
    }
  };

  const handleComplete = async () => {
    if (isCompleting) {
      console.log('[AlertDisplay] Already completing, ignoring duplicate call');
      return;
    }
    
    setIsCompleting(true);
    console.log('[AlertDisplay] 🏁 STARTING COMPLETION for alert:', currentAlert.id);

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

  const setupTimerBasedAlert = (mediaDurationMs: number) => {
    if (timerSystemSetup) {
      console.log('[AlertDisplay] ⚠️ Timer system already set up, skipping duplicate setup');
      return;
    }
    
    console.log('[AlertDisplay] 🕒 Setting up timer-based alert system');
    console.log('[AlertDisplay] Media duration:', mediaDurationMs + 'ms', 'Repeats:', repeatCount, 'Delay:', repeatDelay + 'ms');
    
    setTimerSystemSetup(true);
    
    // Calculate completion times for each repeat
    const completionTimes: number[] = [];
    let cumulativeTime = 0;
    
    for (let i = 0; i < repeatCount; i++) {
      cumulativeTime += mediaDurationMs;
      if (i < repeatCount - 1) { // Add delay except for the last repeat
        cumulativeTime += repeatDelay;
      }
      completionTimes.push(cumulativeTime);
    }
    
    console.log('[AlertDisplay] Scheduled completion times:', completionTimes.map((time, i) => `Repeat ${i + 1}: ${time}ms`));
    
    // Set up timer for each repeat completion
    completionTimes.forEach((time, index) => {
      const timer = setTimeout(() => {
        if (isCompleting) return;
        
        const repeatNumber = index + 1;
        console.log('[AlertDisplay] ⏰ Timer triggered for repeat:', repeatNumber, 'of', repeatCount);
        setCurrentRepeat(index);
        
        if (repeatNumber === repeatCount) {
          // Last repeat - complete the alert
          console.log('[AlertDisplay] 🏁 Final repeat complete, finishing alert');
          handleComplete();
        } else {
          // Not the last repeat - continue to next (no video restart needed)
          console.log('[AlertDisplay] 🔄 Repeat', repeatNumber, 'complete, continuing to next');
        }
      }, time);
      
      alertTimersRef.current.push(timer);
    });
    
    // Calculate total duration with buffer
    const totalDuration = completionTimes[completionTimes.length - 1] + 5000; // 5s buffer
    console.log('[AlertDisplay] Total alert duration (with buffer):', totalDuration + 'ms');
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
    heartbeatRef.current = setInterval(sendHeartbeat, 2000) as any;
  };

  const handleVideoLoadedMetadata = () => {
    const video = mediaRef.current as HTMLVideoElement;
    if (video && video.duration && !videoDuration && !timerSystemSetup) {
      const duration = video.duration * 1000; // Convert to milliseconds
      setVideoDuration(duration);
      console.log('[AlertDisplay] 📹 Video metadata loaded, duration:', duration + 'ms');
      setupTimerBasedAlert(duration);
      
      // Stop duration detection since we have the duration
      if (durationDetectionRef.current) {
        clearInterval(durationDetectionRef.current);
        durationDetectionRef.current = undefined;
      }
    }
  };

  const detectVideoDuration = () => {
    const video = mediaRef.current as HTMLVideoElement;
    if (!video || videoDuration || timerSystemSetup) return;
    
    // Try to get duration even if metadata isn't fully loaded
    if (video.duration && video.duration > 0) {
      const duration = video.duration * 1000;
      setVideoDuration(duration);
      console.log('[AlertDisplay] 📹 Video duration detected:', duration + 'ms');
      setupTimerBasedAlert(duration);
      return;
    }
    
    // Keep trying every 100ms for up to 10 seconds
    let attempts = 0;
    const maxAttempts = 100;
    
    durationDetectionRef.current = setInterval(() => {
      attempts++;
      
      if (video.duration && video.duration > 0) {
        const duration = video.duration * 1000;
        setVideoDuration(duration);
        console.log('[AlertDisplay] 📹 Video duration detected after', attempts, 'attempts:', duration + 'ms');
        setupTimerBasedAlert(duration);
        
        if (durationDetectionRef.current) {
          clearInterval(durationDetectionRef.current);
          durationDetectionRef.current = undefined;
        }
      } else if (attempts >= maxAttempts) {
        console.warn('[AlertDisplay] ⚠️ Could not detect video duration, using fallback');
        const fallbackDuration = displayDuration; // Use display_duration as fallback
        setVideoDuration(fallbackDuration);
        setupTimerBasedAlert(fallbackDuration);
        
        if (durationDetectionRef.current) {
          clearInterval(durationDetectionRef.current);
          durationDetectionRef.current = undefined;
        }
      }
    }, 100) as any;
  };

  useEffect(() => {
    console.log('[AlertDisplay] 🚀 Alert mounted:', currentAlert.id, 'Type:', actualMediaType, 'Repeats:', repeatCount);
    setIsCompleting(false);
    setCurrentRepeat(0);
    setVideoDuration(null);
    setTimerSystemSetup(false);
    
    // Start heartbeat immediately
    startHeartbeat();
    
    if (actualMediaType === 'image') {
      // For images, we know the duration immediately
      console.log('[AlertDisplay] 🖼️ Image alert, using display duration:', displayDuration + 'ms');
      setupTimerBasedAlert(displayDuration);
    } else {
      // For videos, start trying to detect duration
      console.log('[AlertDisplay] 📹 Video alert, waiting for duration detection');
      // Small delay to let video element initialize
      setTimeout(detectVideoDuration, 100);
    }
    
    return () => {
      console.log('[AlertDisplay] 🧹 Alert unmounted:', currentAlert.id);
      clearAllTimers();
    };
  }, [currentAlert.id]);

  // Log for debugging visual events (but don't use for timing)
  const handleVideoPlay = () => {
    const elapsed = Date.now() - alertStartTime;
    console.log('[AlertDisplay] 🎬 Video play event at', elapsed + 'ms', 'repeat:', currentRepeat + 1);
  };

  const handleVideoEnded = () => {
    const elapsed = Date.now() - alertStartTime;
    console.log('[AlertDisplay] 🎬 Video ended event at', elapsed + 'ms', 'repeat:', currentRepeat + 1, '(visual only)');
  };

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
            onLoadedMetadata={handleVideoLoadedMetadata}
            onLoadedData={detectVideoDuration}
            onCanPlay={detectVideoDuration}
            onPlay={handleVideoPlay}
            onEnded={handleVideoEnded}
            onError={() => {
              console.error('[AlertDisplay] Video error, using fallback duration');
              if (!videoDuration) {
                setupTimerBasedAlert(displayDuration);
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
