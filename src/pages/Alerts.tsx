import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";

const Alerts = () => {
  const [currentAlert, setCurrentAlert] = useState<{
    id: string;
    media_url: string;
    media_type: string;
    message_enabled?: boolean;
    message_text?: string;
    font_size?: number;
  } | null>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement>(null);
  const { alertSlug, username } = useParams();
  const completingRef = useRef(false);

  // Function to convert title to slug
  const titleToSlug = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, '-');
  };

  // Function to format username from URL
  const formatUsername = (username: string) => {
    return username.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  useEffect(() => {
    const channel = supabase.channel('alerts');

    channel
      .on('broadcast', { event: 'play_alert' }, ({ payload }) => {
        console.log('Received alert:', payload);
        setCurrentAlert(payload);
        setShowPlayButton(false);
      })
      .subscribe((status) => {
        console.log('Channel status:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Effect to handle URL-based alert triggering
  useEffect(() => {
    const triggerAlertFromUrl = async () => {
      if (!alertSlug || completingRef.current) return;

      const { data: alerts } = await supabase
        .from('alerts')
        .select('*');

      if (!alerts) return;

      const matchingAlert = alerts.find(alert => titleToSlug(alert.title) === alertSlug);
      
      if (matchingAlert) {
        completingRef.current = true;
        
        // Add to queue instead of playing immediately
        const { error } = await supabase
          .from('alert_queue')
          .insert({
            alert_id: matchingAlert.id,
            username: username ? formatUsername(username) : null,
            status: 'pending'
          });

        if (error) {
          console.error('Error queueing alert:', error);
        }
      }
    };

    triggerAlertFromUrl();
  }, [alertSlug, username]);

  useEffect(() => {
    if (currentAlert && mediaRef.current) {
      console.log('Playing media:', currentAlert.media_url, currentAlert.media_type);
      if (currentAlert.media_type.startsWith('video')) {
        const videoElement = mediaRef.current as HTMLVideoElement;
        videoElement.play().catch(error => {
          console.error('Error playing video:', error);
          if (error.name === 'NotAllowedError') {
            setShowPlayButton(true);
          }
        });
      }
      
      const timer = setTimeout(() => {
        if (!currentAlert.media_type.startsWith('video')) {
          handleAlertComplete();
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentAlert]);

  const handleManualPlay = () => {
    if (mediaRef.current && currentAlert?.media_type.startsWith('video')) {
      const videoElement = mediaRef.current as HTMLVideoElement;
      videoElement.play().catch(error => {
        console.error('Error playing video:', error);
      });
      setShowPlayButton(false);
    }
  };

  const handleAlertComplete = async () => {
    // Mark the current alert as completed in the queue
    const { data: queueData } = await supabase
      .from('alert_queue')
      .select('id')
      .eq('status', 'playing')
      .single();

    if (queueData) {
      await supabase
        .from('alert_queue')
        .update({ 
          status: 'completed',
          played_at: new Date().toISOString()
        })
        .eq('id', queueData.id);

      // Notify that the alert is completed
      await supabase
        .channel('alert-queue')
        .send({
          type: 'broadcast',
          event: 'alert_completed',
          payload: { id: queueData.id }
        });
    }

    setCurrentAlert(null);
    completingRef.current = false;
  };

  const handleVideoEnded = () => {
    handleAlertComplete();
  };

  if (!currentAlert) return null;

  const renderMessage = () => {
    if (!currentAlert.message_enabled || !currentAlert.message_text) return null;

    const parts = currentAlert.message_text.split(' ');
    const name = parts[0];
    const message = parts.slice(1).join(' ');

    return (
      <div 
        className="absolute bottom-10 w-full text-center"
        style={{
          fontFamily: 'Radiate Sans Extra Bold',
          fontSize: `${currentAlert.font_size}px`,
        }}
      >
        <span className="text-[#31c3a6]">{name}</span>
        {message && <span className="text-white"> {message}</span>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {currentAlert.media_type.startsWith('video') ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={currentAlert.media_url}
            className="w-full h-full object-contain"
            onEnded={handleVideoEnded}
            autoPlay
            playsInline
            muted
          />
        ) : (
          <img
            ref={mediaRef as React.RefObject<HTMLImageElement>}
            src={currentAlert.media_url}
            className="w-full h-full object-contain"
            alt="Alert"
          />
        )}
        {showPlayButton && (
          <Button
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            size="lg"
            onClick={handleManualPlay}
          >
            <Play className="mr-2 h-6 w-6" />
            Play with Sound
          </Button>
        )}
        {renderMessage()}
      </div>
    </div>
  );
};

export default Alerts;