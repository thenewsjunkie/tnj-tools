import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export interface ReaderSettings {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  theme: "light" | "dark" | "sepia";
  mode: "paginated" | "scroll";
}

export interface TTSSettings {
  rate: number;
  voiceURI: string;
}

interface ReaderControlsProps {
  settings: ReaderSettings;
  onChange: (s: ReaderSettings) => void;
  fileType: string;
  ttsSettings?: TTSSettings;
  onTTSChange?: (s: TTSSettings) => void;
}

export default function ReaderControls({ settings, onChange, fileType, ttsSettings, onTTSChange }: ReaderControlsProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);
  return (
    <div className="space-y-5 p-4">
      <h3 className="font-semibold text-foreground">Reading Settings</h3>

      <div className="space-y-2">
        <Label>Font Family</Label>
        <Select
          value={settings.fontFamily}
          onValueChange={(v) => onChange({ ...settings, fontFamily: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="serif">Serif</SelectItem>
            <SelectItem value="sans-serif">Sans-Serif</SelectItem>
            <SelectItem value="monospace">Monospace</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Font Size: {settings.fontSize}px</Label>
        <Slider
          min={12}
          max={32}
          step={1}
          value={[settings.fontSize]}
          onValueChange={([v]) => onChange({ ...settings, fontSize: v })}
        />
      </div>

      <div className="space-y-2">
        <Label>Line Height: {settings.lineHeight}</Label>
        <Slider
          min={1}
          max={2.5}
          step={0.1}
          value={[settings.lineHeight]}
          onValueChange={([v]) => onChange({ ...settings, lineHeight: v })}
        />
      </div>

      <div className="space-y-2">
        <Label>Theme</Label>
        <div className="flex gap-2">
          {(["light", "dark", "sepia"] as const).map((t) => (
            <Button
              key={t}
              variant={settings.theme === t ? "default" : "outline"}
              size="sm"
              onClick={() => onChange({ ...settings, theme: t })}
              className="capitalize"
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      {fileType === "epub" && (
        <div className="space-y-2">
          <Label>Mode</Label>
          <div className="flex gap-2">
            {(["paginated", "scroll"] as const).map((m) => (
              <Button
                key={m}
                variant={settings.mode === m ? "default" : "outline"}
                size="sm"
                onClick={() => onChange({ ...settings, mode: m })}
                className="capitalize"
              >
                {m}
              </Button>
            ))}
          </div>
        </div>
      )}

      {ttsSettings && onTTSChange && (
        <>
          <div className="border-t border-border pt-4">
            <h3 className="font-semibold text-foreground mb-3">Read Aloud</h3>
          </div>

          <div className="space-y-2">
            <Label>Speed: {ttsSettings.rate}x</Label>
            <Slider
              min={0.5}
              max={2}
              step={0.1}
              value={[ttsSettings.rate]}
              onValueChange={([v]) => onTTSChange({ ...ttsSettings, rate: v })}
            />
          </div>

          <div className="space-y-2">
            <Label>Voice</Label>
            <Select
              value={ttsSettings.voiceURI}
              onValueChange={(v) => onTTSChange({ ...ttsSettings, voiceURI: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Default voice" />
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
        </>
      )}
    </div>
  );
}
