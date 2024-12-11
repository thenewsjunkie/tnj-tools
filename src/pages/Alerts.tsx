import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const Alerts = () => {
  const [currentAlert, setCurrentAlert] = useState<{
    id: string;
    media_url: string;
    media_type: string;
  } | null>(null);
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement>(null);

  useEffect(() => {
    const channel = supabase.channel('alerts');

    channel
      .on('broadcast', { event: 'play_alert' }, ({ payload }) => {
        console.log('Received alert:', payload);
        setCurrentAlert(payload);
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
        });
      }
      
      // Clear alert after playback (5s for images, automatic for videos)
      const timer = setTimeout(() => {
        setCurrentAlert(null);
      }, currentAlert.media_type.startsWith('video') ? 0 : 5000);

      return () => clearTimeout(timer);
    }
  }, [currentAlert]);

  if (!currentAlert) return null;

  return (
    <div className="fixed inset-0 pointer-events-none">
      {currentAlert.media_type.startsWith('video') ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={currentAlert.media_url}
          className="w-full h-full object-contain"
          onEnded={() => setCurrentAlert(null)}
          autoPlay
          playsInline
        />
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