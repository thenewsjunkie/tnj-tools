import { Volume2, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Rejoin } from '@/hooks/useRejoins';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface RejoinButtonProps {
  rejoin: Rejoin;
  isPlaying: boolean;
  remainingTime?: number | null;
  onPlay: () => void;
  onStop: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function RejoinButton({
  rejoin,
  isPlaying,
  remainingTime,
  onPlay,
  onStop,
  onEdit,
  onDelete,
}: RejoinButtonProps) {
  const handleClick = () => {
    if (isPlaying) {
      onStop();
    } else {
      onPlay();
    }
  };

  const getContrastColor = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  const textColor = getContrastColor(rejoin.color);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          onClick={handleClick}
          className={cn(
            'relative flex flex-col items-center justify-center p-2 rounded-lg transition-all',
            'h-16 w-full min-w-0',
            'hover:scale-105 hover:shadow-lg active:scale-95',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            isPlaying && 'animate-pulse ring-2 ring-white/50'
          )}
          style={{ backgroundColor: rejoin.color, color: textColor }}
        >
          {isPlaying ? (
            <Square className="h-4 w-4 mb-1 fill-current" />
          ) : (
            <Volume2 className="h-4 w-4 mb-1" />
          )}
          {isPlaying && remainingTime != null ? (
            <span className="text-xs font-mono font-bold">
              {formatTime(remainingTime)}
            </span>
          ) : (
            <span className="text-xs font-medium truncate w-full text-center px-1">
              {rejoin.title}
            </span>
          )}
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onEdit}>Edit</ContextMenuItem>
        <ContextMenuItem onClick={onDelete} className="text-destructive">
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
