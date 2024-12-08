import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface MediaDeviceInitializerProps {
  onStreamReady: (stream: MediaStream) => void;
  onError: (error: string) => void;
}

const MediaDeviceInitializer = ({ onStreamReady, onError }: MediaDeviceInitializerProps) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();

  const initializeStream = async () => {
    try {
      console.log('Initializing media stream...');
      setIsInitializing(true);

      // iOS Safari requires specific constraints
      const constraints: MediaStreamConstraints = {
        video: { facingMode: 'user' },
        audio: true
      };

      console.log('Requesting media with constraints:', constraints);
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('Media stream obtained:', {
        id: mediaStream.id,
        tracks: mediaStream.getTracks().map(t => ({
          kind: t.kind,
          enabled: t.enabled,
          label: t.label
        }))
      });

      onStreamReady(mediaStream);
      setIsInitializing(false);
    } catch (err) {
      console.error('Camera access error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      onError(errorMessage);
      setIsInitializing(false);
      
      toast({
        title: "Camera Access Error",
        description: "Please enable camera and microphone access to join. Make sure you're using Safari on iOS.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const checkMediaPermissions = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Your browser doesn't support media devices");
        }
        await initializeStream();
      } catch (error) {
        console.error('Media permissions error:', error);
        onError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    checkMediaPermissions();
  }, []);

  return isInitializing ? (
    <div className="flex items-center justify-center h-[300px] bg-black/90 rounded-lg">
      <p className="text-white">Initializing camera...</p>
    </div>
  ) : null;
};

export default MediaDeviceInitializer;