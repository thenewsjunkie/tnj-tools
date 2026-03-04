import { useState, useRef, useEffect } from "react";
import { ShowSong } from "@/hooks/useShowSongs";
import { Play, Pause, SkipForward, SkipBack, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface MusicPlayerProps {
  songs: ShowSong[];
  initialIndex?: number;
}

const MusicPlayer = ({ songs, initialIndex = 0 }: MusicPlayerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentSong = songs[currentIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.audio_url;
      if (isPlaying) audioRef.current.play();
    }
  }, [currentIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const pct = (audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100;
    setProgress(pct);
  };

  const handleSeek = (val: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = (val[0] / 100) * (audioRef.current.duration || 0);
    setProgress(val[0]);
  };

  const handleEnded = () => {
    if (currentIndex < songs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsPlaying(false);
      setProgress(0);
    }
  };

  const prev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const next = () => {
    if (currentIndex < songs.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (!currentSong) {
    return <p className="text-muted-foreground text-sm p-4">No songs available</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-background text-foreground rounded-xl max-w-md mx-auto">
      {/* Album art placeholder */}
      <div className="w-48 h-48 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
        {currentSong.cover_url ? (
          <img src={currentSong.cover_url} alt={currentSong.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-4xl text-muted-foreground">♪</div>
        )}
      </div>

      {/* Title / Artist */}
      <div className="text-center">
        <h3 className="font-semibold text-lg">{currentSong.title}</h3>
        {currentSong.artist && (
          <p className="text-sm text-muted-foreground">{currentSong.artist}</p>
        )}
      </div>

      {/* Progress */}
      <div className="w-full space-y-1">
        <Slider
          value={[progress]}
          max={100}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(audioRef.current?.currentTime ?? 0)}</span>
          <span>{formatTime(audioRef.current?.duration ?? currentSong.duration ?? 0)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {songs.length > 1 && (
          <button onClick={prev} className="p-2 hover:text-primary transition-colors" disabled={currentIndex === 0}>
            <SkipBack className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={togglePlay}
          className="p-3 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </button>
        {songs.length > 1 && (
          <button onClick={next} className="p-2 hover:text-primary transition-colors" disabled={currentIndex === songs.length - 1}>
            <SkipForward className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 w-32">
        <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
        <Slider
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
        preload="metadata"
      />
    </div>
  );
};

export default MusicPlayer;
