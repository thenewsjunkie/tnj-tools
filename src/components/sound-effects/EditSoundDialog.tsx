import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { SoundEffect } from '@/hooks/useSoundEffects';

const COLOR_PRESETS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
];

interface EditSoundDialogProps {
  sound: SoundEffect | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    id: string;
    title?: string;
    color?: string;
    volume?: number;
    trim_start?: number;
    trim_end?: number | null;
  }) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  isLoading: boolean;
}

export function EditSoundDialog({
  sound,
  open,
  onOpenChange,
  onSave,
  onDelete,
  isLoading,
}: EditSoundDialogProps) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [volume, setVolume] = useState(1);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (sound) {
      setTitle(sound.title);
      setColor(sound.color);
      setVolume(sound.volume);
      setTrimStart(sound.trim_start);
      setTrimEnd(sound.trim_end);
    }
  }, [sound]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handlePlayPreview = () => {
    if (!sound) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(sound.audio_url);
    audioRef.current = audio;
    audio.volume = Math.min(volume, 1);
    audio.currentTime = trimStart;

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
      const end = trimEnd ?? sound.duration ?? audio.duration;
      if (audio.currentTime >= end) {
        audio.pause();
        setIsPlaying(false);
      }
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });

    audio.play();
    setIsPlaying(true);
  };

  const handleSetTrimStart = () => {
    if (audioRef.current) {
      setTrimStart(audioRef.current.currentTime);
    }
  };

  const handleSetTrimEnd = () => {
    if (audioRef.current) {
      setTrimEnd(audioRef.current.currentTime);
    }
  };

  const handleResetTrim = () => {
    setTrimStart(0);
    setTrimEnd(null);
  };

  const handleSave = async () => {
    if (!sound) return;
    await onSave({
      id: sound.id,
      title,
      color,
      volume,
      trim_start: trimStart,
      trim_end: trimEnd,
    });
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!sound) return;
    await onDelete(sound.id);
    onOpenChange(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const duration = sound?.duration ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Sound Effect</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  className={`h-8 w-8 rounded-full transition-all ${
                    color === preset ? 'ring-2 ring-ring ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: preset }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-8 w-8 rounded-full cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Volume: {Math.round(volume * 100)}%</Label>
            <Slider
              value={[volume * 100]}
              onValueChange={([v]) => setVolume(v / 100)}
              min={0}
              max={200}
              step={5}
            />
          </div>

          <div className="space-y-2">
            <Label>Trim</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePlayPreview}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <span className="text-sm text-muted-foreground font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSetTrimStart}
              >
                Set Start ({formatTime(trimStart)})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSetTrimEnd}
              >
                Set End ({formatTime(trimEnd ?? duration)})
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetTrim}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              Delete
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
