import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Square,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";
import type { TTSSettings } from "./ReaderControls";

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

interface AudioPlayerBarProps {
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onPrev: () => void;
  onNext: () => void;
  ttsSettings: TTSSettings;
  onTTSChange: (s: TTSSettings) => void;
  chapterLabel: string;
}

export default function AudioPlayerBar({
  isPaused,
  onPlay,
  onPause,
  onStop,
  onPrev,
  onNext,
  ttsSettings,
  onTTSChange,
  chapterLabel,
}: AudioPlayerBarProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  return (
    <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur px-3 py-2">
      <div className="flex items-center gap-2">
        {/* Transport controls */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onStop} title="Stop">
            <Square className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPrev} title="Previous page">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={isPaused ? onPlay : onPause}
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play className="w-4 h-4 ml-0.5" /> : <Pause className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNext} title="Next page">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Chapter label */}
        <p className="flex-1 text-xs text-muted-foreground truncate min-w-0 text-center">
          {chapterLabel || "Reading aloud…"}
        </p>

        {/* Speed */}
        <Select
          value={String(ttsSettings.rate)}
          onValueChange={(v) => onTTSChange({ ...ttsSettings, rate: parseFloat(v) })}
        >
          <SelectTrigger className="w-[72px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SPEED_OPTIONS.map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s}x
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Voice */}
        <Select
          value={ttsSettings.voiceURI}
          onValueChange={(v) => onTTSChange({ ...ttsSettings, voiceURI: v })}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Voice" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Default</SelectItem>
            {voices.map((v) => (
              <SelectItem key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
