import { X } from "lucide-react";
import type { MediaItem } from "./types";

interface MediaDisplayProps {
  media: MediaItem;
  onClose: () => void;
}

export const MediaDisplay = ({ media, onClose }: MediaDisplayProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>
      <div className="w-full h-full max-w-7xl max-h-screen p-4">
        {media.type === 'youtube' ? (
          <iframe
            src={`https://www.youtube.com/embed/${media.id}?autoplay=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <iframe
            src={`https://platform.twitter.com/embed/Tweet.html?id=${media.id}`}
            className="w-full h-full"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
};