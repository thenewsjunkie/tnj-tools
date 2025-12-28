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
import { SoundEffect } from '@/hooks/useSoundEffects';
import { WaveformEditor } from './WaveformEditor';

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
    file?: File;
    oldAudioUrl?: string;
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
  const [newFile, setNewFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sound) {
      setTitle(sound.title);
      setColor(sound.color);
      setVolume(sound.volume);
      setTrimStart(sound.trim_start);
      setTrimEnd(sound.trim_end);
      setNewFile(null);
    }
  }, [sound]);

  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop();
        } catch (e) {}
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setNewFile(selectedFile);
      // Reset trim when new file is selected
      setTrimStart(0);
      setTrimEnd(null);
    }
  };

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {}
      sourceNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsPlaying(false);
  };

  const handlePlayPreview = async () => {
    if (!sound) return;

    if (isPlaying) {
      stopPlayback();
      return;
    }

    try {
      // Get audio source
      const audioSource = newFile ? URL.createObjectURL(newFile) : sound.audio_url;
      const response = await fetch(audioSource);
      if (!response.ok) throw new Error('Failed to fetch audio');
      const arrayBuffer = await response.arrayBuffer();

      // Create audio context
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Set up gain node for volume (supports >1.0)
      const gainNode = audioContext.createGain();
      gainNode.gain.value = Math.max(volume, 0);
      gainNode.connect(audioContext.destination);

      // Create source
      const sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(gainNode);
      sourceNodeRef.current = sourceNode;

      // Calculate playback
      const actualDuration = audioBuffer.duration;
      const end = trimEnd ?? sound.duration ?? actualDuration;
      const playDuration = end - trimStart;

      offsetRef.current = trimStart;
      startTimeRef.current = audioContext.currentTime;

      // Update current time during playback
      const updateTime = () => {
        if (audioContextRef.current && isPlaying) {
          const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
          const pos = offsetRef.current + elapsed;
          setCurrentTime(pos);
          if (pos < end) {
            animationFrameRef.current = requestAnimationFrame(updateTime);
          }
        }
      };

      sourceNode.onended = () => {
        stopPlayback();
      };

      sourceNode.start(0, trimStart, playDuration);
      setIsPlaying(true);
      setCurrentTime(trimStart);
      animationFrameRef.current = requestAnimationFrame(updateTime);

    } catch (err) {
      console.error('Preview playback error:', err);
      setIsPlaying(false);
    }
  };

  const handleSeek = (time: number) => {
    // For seek, we need to restart playback at new position
    setCurrentTime(time);
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
      ...(newFile && { file: newFile, oldAudioUrl: sound.audio_url }),
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
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
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
            {sound && (
              <WaveformEditor
                audioUrl={newFile ? URL.createObjectURL(newFile) : sound.audio_url}
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
