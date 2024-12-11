import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Alerts = () => {
  const [currentAlert, setCurrentAlert] = useState<{
    id: string;
    media_url: string;
    media_type: string;
  } | null>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement>(null);

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
      
      // Clear alert after playback (5s for images, automatic for videos)
      const timer = setTimeout(() => {
        if (!currentAlert.media_type.startsWith('video')) {
          setCurrentAlert(null);
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

  if (!currentAlert) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
      {currentAlert.media_type.startsWith('video') ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={currentAlert.media_url}
            className="w-full h-full object-contain"
            onEnded={() => setCurrentAlert(null)}
            autoPlay
            playsInline
            muted
          />
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
        </div>
      ) : (
        <img
          ref={mediaRef as React.RefObject<HTMLImageElement>}
          src={currentAlert.media_url}
          className="w-full h-full object-contain"
          alt="Alert"
        />
      )}
    </div>
  );
};

export default Alerts;