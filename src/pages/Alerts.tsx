import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Alerts = () => {
  const [currentAlert, setCurrentAlert] = useState<{
    id: string;
    media_url: string;
    media_type: string;
    message_enabled?: boolean;
    message_text?: string;
    font_size?: number;
    username?: string;
  } | null>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const processingRef = useRef(false);

  // Query for getting the next pending alert
  const { data: nextAlert, refetch: refetchNextAlert } = useQuery({
    queryKey: ['nextAlert'],
    queryFn: async () => {
      console.log('Fetching next alert...');
      const { data, error } = await supabase
        .from('alert_queue')
        .select(`
          *,
          alert:alerts(
            id,
            media_url,
            media_type,
            message_enabled,
            message_text,
            font_size
          )
        `)
        .eq('status', 'pending')
        .order('created_at')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      console.log('Next alert data:', data);
      return data;
    },
    enabled: !isProcessing && !currentAlert,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel('alert_queue_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alert_queue' },
        () => {
          console.log('Queue change detected, processing state:', { 
            isProcessing: processingRef.current, 
            hasCurrentAlert: !!currentAlert 
          });
          if (!processingRef.current && !currentAlert) {
            refetchNextAlert();
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentAlert, refetchNextAlert]);

  useEffect(() => {
    const processNextAlert = async () => {
      if (nextAlert && !processingRef.current && !currentAlert) {
        console.log('Starting to process alert:', nextAlert.id);
        processingRef.current = true;
        setIsProcessing(true);
        
        const { error } = await supabase
          .from('alert_queue')
          .update({ status: 'playing' })
          .eq('id', nextAlert.id);

        if (error) {
          console.error('Error updating alert status:', error);
          processingRef.current = false;
          setIsProcessing(false);
          return;
        }

        setCurrentAlert({
          ...nextAlert.alert,
          username: nextAlert.username
        });

        if (!nextAlert.alert.media_type.startsWith('video')) {
          setTimeout(async () => {
            await completeAlert(nextAlert.id);
          }, 5000);
        }
      }
    };

    const completeAlert = async (alertId: string) => {
      console.log('Completing alert:', alertId);
      const { error } = await supabase
        .from('alert_queue')
        .update({ 
          status: 'completed',
          played_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        console.error('Error completing alert:', error);
      }

      setCurrentAlert(null);
      setIsProcessing(false);
      processingRef.current = false;
    };

    processNextAlert();
  }, [nextAlert, currentAlert]);

  useEffect(() => {
    if (currentAlert && mediaRef.current) {
      if (currentAlert.media_type.startsWith('video')) {
        const videoElement = mediaRef.current as HTMLVideoElement;
        videoElement.play().catch(error => {
          console.error('Error playing video:', error);
          if (error.name === 'NotAllowedError') {
            setShowPlayButton(true);
          }
        });
      }
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

  const handleVideoEnded = async () => {
    if (currentAlert && nextAlert) {
      console.log('Video ended, completing alert:', nextAlert.id);
      const { error } = await supabase
        .from('alert_queue')
        .update({ 
          status: 'completed',
          played_at: new Date().toISOString()
        })
        .eq('id', nextAlert.id);

      if (error) {
        console.error('Error completing alert:', error);
      }

      setCurrentAlert(null);
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  if (!currentAlert) return null;

  const renderMessage = () => {
    if (!currentAlert.message_enabled || !currentAlert.message_text) return null;

    const message = currentAlert.username 
      ? `${currentAlert.username} ${currentAlert.message_text}`
      : currentAlert.message_text;

    const parts = message.split(' ');
    const name = currentAlert.username ? parts[0] : '';
    const text = currentAlert.username ? parts.slice(1).join(' ') : message;

    return (
      <div 
        className="absolute bottom-10 w-full text-center"
        style={{
          fontFamily: 'Radiate Sans Extra Bold',
          fontSize: `${currentAlert.font_size}px`,
        }}
      >
        {name && <span className="text-[#31c3a6]">{name}</span>}
        {text && <span className="text-white"> {text}</span>}
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