import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Upload } from 'lucide-react';
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
import { Rejoin } from '@/hooks/useRejoins';
import { WaveformEditor } from '@/components/sound-effects/WaveformEditor';

const COLOR_PRESETS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280',
];

interface EditRejoinDialogProps {
  rejoin: Rejoin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    id: string;
    title?: string;
    color?: string;
    volume?: number;
    trim_start?: number;
    trim_end?: number | null;
    file?: File;
    oldAudioUrl?: string;
  }) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
  isLoading: boolean;
}

export function EditRejoinDialog({
  rejoin,
  open,
  onOpenChange,
  onSave,
  onDelete,
  isLoading,
}: EditRejoinDialogProps) {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [volume, setVolume] = useState(1);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState<number | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (rejoin) {
      setTitle(rejoin.title);
      setColor(rejoin.color);
      setVolume(rejoin.volume);
      setTrimStart(rejoin.trim_start);
      setTrimEnd(rejoin.trim_end);
      setNewFile(null);
    }
  }, [rejoin]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setNewFile(selectedFile);
      setTrimStart(0);
      setTrimEnd(null);
    }
  };

  const handlePlayPreview = () => {
    if (!rejoin) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    const audioSource = newFile ? URL.createObjectURL(newFile) : rejoin.audio_url;
    const audio = new Audio(audioSource);
    audioRef.current = audio;
    audio.volume = Math.min(volume, 1);
    audio.currentTime = trimStart;

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
      const end = trimEnd ?? rejoin.duration ?? audio.duration;
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

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleResetTrim = () => {
    setTrimStart(0);
    setTrimEnd(null);
  };

  const handleSave = async () => {
    if (!rejoin) return;
    await onSave({
      id: rejoin.id,
      title,
      color,
      volume,
      trim_start: trimStart,
      trim_end: trimEnd,
      ...(newFile && { file: newFile, oldAudioUrl: rejoin.audio_url }),
    });
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!rejoin) return;
    await onDelete(rejoin.id);
    onOpenChange(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const duration = rejoin?.duration ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Rejoin</DialogTitle>
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
            <Label>Replace Audio File</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center h-12 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              {newFile ? (
                <span className="text-sm text-muted-foreground">{newFile.name}</span>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">Click to replace audio</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
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
            {rejoin && (
              <WaveformEditor
                audioUrl={newFile ? URL.createObjectURL(newFile) : rejoin.audio_url}
                file={newFile}
                duration={duration}
                trimStart={trimStart}
                trimEnd={trimEnd}
                currentTime={currentTime}
                isPlaying={isPlaying}
                onTrimStartChange={setTrimStart}
                onTrimEndChange={setTrimEnd}
                onSeek={handleSeek}
              />
            )}
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
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetTrim}
                title="Reset trim"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Start: {formatTime(trimStart)} | End: {formatTime(trimEnd ?? duration)}
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
