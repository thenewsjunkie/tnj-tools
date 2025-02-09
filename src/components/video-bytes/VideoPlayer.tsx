
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VideoByteType {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  created_at: string;
}

interface VideoPlayerProps {
  video: VideoByteType | null;
  onClose: () => void;
}

export function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  if (!video) return null;

  return (
    <Dialog open={!!video} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[100vw] max-h-[100vh] p-0 border-0 bg-black/95">
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <video
            src={video.video_url}
            controls
            autoPlay
            className="max-w-full max-h-full w-auto h-auto object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
