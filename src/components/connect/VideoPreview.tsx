import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Mic, MicOff } from "lucide-react";

interface VideoPreviewProps {
  stream: MediaStream | null;
  isMuted: boolean;
  toggleMicrophone: () => void;
}

const VideoPreview = ({ stream, isMuted, toggleMicrophone }: VideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      console.log('Setting video stream to element:', {
        streamId: stream.id,
        tracks: stream.getTracks().map(t => ({
          kind: t.kind,
          enabled: t.enabled,
          muted: t.muted
        }))
      });
      
      videoRef.current.srcObject = stream;
      
      // iOS Safari specific playback handling
      const playVideo = async () => {
        try {
          if (!videoRef.current?.played.length) {
            console.log('Attempting to play video...');
            const playPromise = videoRef.current?.play();
            await playPromise;
            console.log('Video playback started successfully');
          }
        } catch (err) {
          console.error('Error playing video:', err);
        }
      };
      
      // Try to play immediately and also on user interaction
      playVideo();
      document.addEventListener('touchstart', playVideo, { once: true });
      
      return () => {
        document.removeEventListener('touchstart', playVideo);
      };
    }
  }, [stream]);

  return (
    <div className="relative aspect-video bg-black/90 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleMicrophone}
          className="rounded-full bg-black/50 hover:bg-black/70"
        >
          {isMuted ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full bg-black/50 hover:bg-black/70"
        >
          <Camera className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default VideoPreview;