import { ExternalLink, Trash2 } from "lucide-react";
import type { MediaItem } from "./types";

interface MediaGridProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onDelete: (id: string) => void;
}

export const MediaGrid = ({ items, onDelete }: MediaGridProps) => {
  const handlePlay = (item: MediaItem) => {
    if (item.type === 'youtube') {
      window.open(`https://www.youtube.com/watch?v=${item.id}`, '_blank');
    } else if (item.type === 'twitter') {
      window.open(item.url, '_blank');
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.id} className="relative group">
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2">
              <p className="text-white text-sm truncate">{item.title}</p>
            </div>
            <button
              onClick={() => handlePlay(item)}
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ExternalLink className="w-12 h-12 text-white" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};