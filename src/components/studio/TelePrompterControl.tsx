import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useTelePrompter, useUpdateTelePrompter, TelePrompterConfig } from "@/hooks/useTelePrompter";
import { Play, Pause, RotateCcw, ExternalLink, FlipHorizontal2, Type, Gauge } from "lucide-react";

const TelePrompterControl = () => {
  const { data: config } = useTelePrompter();
  const { mutate: save } = useUpdateTelePrompter();

  const defaults: TelePrompterConfig = {
    script: "",
    isPlaying: false,
    speed: 3,
    fontSize: 36,
    mirror: false,
    scrollPosition: 0,
  };

  const c = config ?? defaults;

  const update = (partial: Partial<TelePrompterConfig>) => {
    save({ ...c, ...partial });
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-purple-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Type className="h-5 w-5 text-purple-400" />
          TelePrompter
          <a
            href="/teleprompter"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Script */}
        <Textarea
          placeholder="Paste your script here…"
          className="min-h-[120px] text-sm bg-background/50"
          value={c.script}
          onChange={(e) => update({ script: e.target.value })}
        />

        {/* Playback controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={c.isPlaying ? "destructive" : "default"}
            onClick={() => update({ isPlaying: !c.isPlaying })}
            className="gap-1"
          >
            {c.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {c.isPlaying ? "Pause" : "Play"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => update({ isPlaying: false, scrollPosition: Date.now() })}
            className="gap-1"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-3">
          <Gauge className="h-4 w-4 text-purple-400 shrink-0" />
          <span className="text-xs text-muted-foreground w-12">Speed</span>
          <Slider
            min={1}
            max={10}
            step={1}
            value={[c.speed]}
            onValueChange={([v]) => update({ speed: v })}
            className="flex-1"
          />
          <span className="text-xs w-6 text-right">{c.speed}</span>
        </div>

        {/* Font Size */}
        <div className="flex items-center gap-3">
          <Type className="h-4 w-4 text-purple-400 shrink-0" />
          <span className="text-xs text-muted-foreground w-12">Size</span>
          <Slider
            min={24}
            max={72}
            step={2}
            value={[c.fontSize]}
            onValueChange={([v]) => update({ fontSize: v })}
            className="flex-1"
          />
          <span className="text-xs w-6 text-right">{c.fontSize}</span>
        </div>

        {/* Mirror */}
        <div className="flex items-center gap-3">
          <FlipHorizontal2 className="h-4 w-4 text-purple-400 shrink-0" />
          <span className="text-xs text-muted-foreground">Mirror Mode</span>
          <Switch
            checked={c.mirror}
            onCheckedChange={(v) => update({ mirror: v })}
            className="ml-auto"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TelePrompterControl;
