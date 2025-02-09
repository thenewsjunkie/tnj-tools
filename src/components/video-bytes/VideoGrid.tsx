
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface VideoByteType {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  created_at: string;
}

interface VideoGridProps {
  videos: VideoByteType[];
  onPlay: (video: VideoByteType) => void;
  onEdit: (video: VideoByteType) => void;
  onDelete: (video: VideoByteType) => void;
}

export function VideoGrid({ videos, onPlay, onEdit, onDelete }: VideoGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {videos?.map((video) => (
        <div key={video.id} className="space-y-2">
          <div 
            onClick={() => onPlay(video)} 
            className="cursor-pointer"
            role="button"
            aria-label={`Play ${video.title}`}
          >
            <video
              src={video.video_url}
              className="w-full rounded-lg bg-muted"
              preload="metadata"
            />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">{video.title}</h3>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(video)}
                className="h-7 w-7"
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(video)}
                className="h-7 w-7 text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
