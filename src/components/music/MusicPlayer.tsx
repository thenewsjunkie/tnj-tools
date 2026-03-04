import { useState, useRef, useEffect } from "react";
import { ShowSong } from "@/hooks/useShowSongs";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface MusicPlayerProps {
  songs: ShowSong[];
  initialIndex?: number;
}

const RedSlider = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>) => (
  <SliderPrimitive.Root
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-[hsl(0,0%,85%)]">
      <SliderPrimitive.Range className="absolute h-full bg-[hsl(0,84%,50%)]" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full bg-[hsl(0,84%,50%)] shadow-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(0,84%,50%)] focus-visible:ring-offset-2" />
  </SliderPrimitive.Root>
);

const VolumeSlider = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>) => (
  <SliderPrimitive.Root
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-[hsl(0,0%,80%)]">
      <SliderPrimitive.Range className="absolute h-full bg-[hsl(0,0%,55%)]" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-3 w-3 rounded-full bg-[hsl(0,0%,45%)] shadow ring-offset-background transition-colors focus-visible:outline-none" />
  </SliderPrimitive.Root>
);

const MusicPlayer = ({ songs, initialIndex = 0 }: MusicPlayerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentSong = songs[currentIndex];

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.audio_url;
      if (isPlaying) audioRef.current.play();
    }
  }, [currentIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const ct = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 1;
    setCurrentTime(ct);
    setDuration(audioRef.current.duration || 0);
    setProgress((ct / dur) * 100);
  };

  const handleSeek = (val: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = (val[0] / 100) * (audioRef.current.duration || 0);
    setProgress(val[0]);
  };

  const handleEnded = () => {
    if (currentIndex < songs.length - 1) setCurrentIndex(currentIndex + 1);
    else { setIsPlaying(false); setProgress(0); }
  };

  const prev = () => { if (currentIndex > 0) setCurrentIndex(currentIndex - 1); };
  const next = () => { if (currentIndex < songs.length - 1) setCurrentIndex(currentIndex + 1); };

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  };

  if (!currentSong) {
    return <p className="text-muted-foreground text-sm p-4">No songs available</p>;
  }

  return (
    <div className="rounded-2xl shadow-lg border border-[hsl(0,0%,88%)] bg-[hsl(0,0%,96%)] p-5 max-w-xs w-full flex flex-col items-center gap-3">
      {/* Logo */}
      <img
        src="/images/newsjunkie-logo.png"
        alt="NewsJunkie"
        className="w-16 h-16 rounded-xl object-contain"
      />

      {/* Song info */}
      <div className="text-center min-w-0 w-full">
        <h3 className="font-semibold text-sm text-[hsl(0,0%,15%)] truncate">{currentSong.title}</h3>
        {currentSong.artist && (
          <p className="text-xs text-[hsl(0,0%,50%)] truncate">{currentSong.artist}</p>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 w-full">
        <span className="text-[10px] font-mono text-[hsl(0,0%,50%)] w-8 text-right tabular-nums">{fmt(currentTime)}</span>
        <RedSlider
          value={[progress]}
          max={100}
          step={0.1}
          onValueChange={handleSeek}
          className="flex-1"
        />
        <span className="text-[10px] font-mono text-[hsl(0,0%,50%)] w-8 tabular-nums">{fmt(duration || currentSong.duration || 0)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {songs.length > 1 && (
          <button onClick={prev} className="p-1.5 text-[hsl(0,0%,50%)] hover:text-[hsl(0,0%,25%)] transition-colors" disabled={currentIndex === 0}>
            <SkipBack className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={togglePlay}
          className="w-14 h-14 rounded-full bg-gradient-to-b from-[hsl(0,0%,90%)] to-[hsl(0,0%,72%)] shadow-md border border-[hsl(0,0%,78%)] flex items-center justify-center hover:from-[hsl(0,0%,88%)] hover:to-[hsl(0,0%,68%)] transition-all active:scale-95"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 text-[hsl(0,0%,25%)]" />
          ) : (
            <Play className="h-6 w-6 text-[hsl(0,0%,25%)] ml-0.5" />
          )}
        </button>
        {songs.length > 1 && (
          <button onClick={next} className="p-1.5 text-[hsl(0,0%,50%)] hover:text-[hsl(0,0%,25%)] transition-colors" disabled={currentIndex === songs.length - 1}>
            <SkipForward className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 w-28">
        <Volume2 className="h-3.5 w-3.5 text-[hsl(0,0%,50%)] flex-shrink-0" />
        <VolumeSlider
          value={[volume * 100]}
          max={100}
          step={1}
          onValueChange={(v) => setVolume(v[0] / 100)}
        />
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={() => { if (audioRef.current) setDuration(audioRef.current.duration); }}
        preload="metadata"
      />
    </div>
  );
};

export default MusicPlayer;
