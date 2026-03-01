import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Monitor, ExternalLink, Plus, Trash2, Video, Sun, Contrast, Maximize } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import {
  useOutputConfig,
  useUpdateOutputConfig,
  STUDIO_MODULES,
  StudioModule,
  VideoPlacement,
  VideoFeed,
  getYouTubeEmbedUrl,
} from "@/hooks/useOutputConfig";
import { toast } from "sonner";

const PLACEMENT_OPTIONS: { value: VideoPlacement; label: string }[] = [
  { value: "center", label: "Center" },
  { value: "pip-left", label: "PiP Left" },
  { value: "pip-right", label: "PiP Right" },
];

const OutputControl = () => {
  const { data: config, isLoading } = useOutputConfig();
  const updateConfig = useUpdateOutputConfig();
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoPlacement, setNewVideoPlacement] = useState<VideoPlacement>("center");

  const leftColumn = config?.leftColumn ?? [];
  const rightColumn = config?.rightColumn ?? [];
  const videoFeeds = config?.videoFeeds ?? [];
  const fullScreenModule = config?.fullScreen ?? null;

  const isInLeft = (id: StudioModule) => leftColumn.includes(id);
  const isInRight = (id: StudioModule) => rightColumn.includes(id);
  const isFullScreen = (id: StudioModule) => fullScreenModule === id;

  const save = (newConfig: typeof config) => {
    if (!newConfig) return;
    updateConfig.mutate(newConfig, {
      onError: (err: any) => toast.error(err.message),
    });
  };

  const toggleModule = (id: StudioModule, column: "left" | "right") => {
    if (!config) return;
    const newConfig = { ...config };

    // If currently full-screen, clear it first
    if (newConfig.fullScreen === id) {
      newConfig.fullScreen = null;
    }

    if (column === "left") {
      newConfig.leftColumn = isInLeft(id)
        ? leftColumn.filter((m) => m !== id)
        : [...leftColumn, id];
    } else {
      newConfig.rightColumn = isInRight(id)
        ? rightColumn.filter((m) => m !== id)
        : [...rightColumn, id];
    }

    save(newConfig);
  };

  const toggleFullScreen = (id: StudioModule) => {
    if (!config) return;
    const newConfig = { ...config };

    if (newConfig.fullScreen === id) {
      newConfig.fullScreen = null;
    } else {
      newConfig.fullScreen = id;
      // Remove from columns
      newConfig.leftColumn = newConfig.leftColumn.filter((m) => m !== id);
      newConfig.rightColumn = newConfig.rightColumn.filter((m) => m !== id);
    }

    save(newConfig);
  };

  const toggleRotate = (column: "left" | "right") => {
    if (!config) return;
    if (column === "left") {
      save({ ...config, leftRotate: !config.leftRotate });
    } else {
      save({ ...config, rightRotate: !config.rightRotate });
    }
  };

  const updateRotateInterval = (seconds: number) => {
    if (!config) return;
    save({ ...config, rotateInterval: Math.max(5, seconds) });
  };

  const addVideo = () => {
    if (!config) return;
    const trimmed = newVideoUrl.trim();
    if (!trimmed) return;

    const embedUrl = getYouTubeEmbedUrl(trimmed);
    if (!embedUrl) {
      toast.error("Invalid YouTube URL");
      return;
    }

    const newFeeds: VideoFeed[] = [...videoFeeds, { url: trimmed, placement: newVideoPlacement }];
    save({ ...config, videoFeeds: newFeeds });
    setNewVideoUrl("");
    toast.success("Video added to output");
  };

  const removeVideo = (index: number) => {
    if (!config) return;
    const newFeeds = videoFeeds.filter((_, i) => i !== index);
    save({ ...config, videoFeeds: newFeeds });
    toast.success("Video removed");
  };

  const updateVideoPlacement = (index: number, placement: VideoPlacement) => {
    if (!config) return;
    const newFeeds = videoFeeds.map((f, i) => (i === index ? { ...f, placement } : f));
    save({ ...config, videoFeeds: newFeeds });
  };

  const anyRotateEnabled = config?.leftRotate || config?.rightRotate;

  return (
    <Card className="border-blue-500/30 bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-blue-400 text-lg">Output Control</CardTitle>
          </div>
          <Link
            to="/output"
            target="_blank"
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            Open Output <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : (
          <>
            {/* Module placement */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center mb-2">
                <span className="text-xs font-semibold text-blue-300/70 uppercase tracking-wider">Module</span>
                <span className="text-[10px] font-semibold text-blue-300/50 uppercase tracking-wider w-14 text-center">Left</span>
                <span className="text-[10px] font-semibold text-green-300/50 uppercase tracking-wider w-14 text-center">Full</span>
                <span className="text-[10px] font-semibold text-blue-300/50 uppercase tracking-wider w-14 text-center">Right</span>
              </div>
              {STUDIO_MODULES.map((mod) => (
                <div key={mod.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                  <span className="text-sm text-gray-300">{mod.label}</span>
                  <button
                    onClick={() => toggleModule(mod.id, "left")}
                    className={`w-14 py-1.5 rounded text-[10px] font-medium transition-colors ${
                      isInLeft(mod.id)
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        : "bg-black/20 text-gray-500 hover:text-gray-300 border border-transparent"
                    }`}
                  >
                    Left
                  </button>
                  <button
                    onClick={() => toggleFullScreen(mod.id)}
                    className={`w-14 py-1.5 rounded text-[10px] font-medium transition-colors flex items-center justify-center gap-0.5 ${
                      isFullScreen(mod.id)
                        ? "bg-green-500/20 text-green-300 border border-green-500/40"
                        : "bg-black/20 text-gray-500 hover:text-gray-300 border border-transparent"
                    }`}
                  >
                    <Maximize className="h-2.5 w-2.5" />
                    Full
                  </button>
                  <button
                    onClick={() => toggleModule(mod.id, "right")}
                    className={`w-14 py-1.5 rounded text-[10px] font-medium transition-colors ${
                      isInRight(mod.id)
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        : "bg-black/20 text-gray-500 hover:text-gray-300 border border-transparent"
                    }`}
                  >
                    Right
                  </button>
                </div>
              ))}
            </div>

            {/* Orientation toggle */}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="text-xs font-semibold text-blue-300/70 uppercase tracking-wider">Layout</span>
              <div className="flex gap-1">
                {(["horizontal", "vertical"] as const).map((o) => (
                  <button
                    key={o}
                    onClick={() => save({ ...config!, orientation: o })}
                    className={`px-3 py-1.5 rounded text-[10px] font-medium transition-colors capitalize ${
                      (config?.orientation ?? "horizontal") === o
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        : "bg-black/20 text-gray-500 hover:text-gray-300 border border-transparent"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Rotation control */}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="text-xs font-semibold text-blue-300/70 uppercase tracking-wider">Rotation</span>
              <div className="flex gap-1">
                {[0, 90, 180, 270].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => save({ ...config!, rotation: deg })}
                    className={`px-3 py-1.5 rounded text-[10px] font-medium transition-colors ${
                      (config?.rotation ?? 0) === deg
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        : "bg-black/20 text-gray-500 hover:text-gray-300 border border-transparent"
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>

            {/* Rotate controls */}
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                Rotate Left
                <Switch checked={!!config?.leftRotate} onCheckedChange={() => toggleRotate("left")} className="scale-75" />
              </span>
              <span className="flex items-center gap-1.5">
                Rotate Right
                <Switch checked={!!config?.rightRotate} onCheckedChange={() => toggleRotate("right")} className="scale-75" />
              </span>
            </div>

            {/* Rotation interval */}
            {anyRotateEnabled && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">Rotate every</span>
                <Input
                  type="number"
                  min={5}
                  value={config?.rotateInterval ?? 30}
                  onChange={(e) => updateRotateInterval(Number(e.target.value))}
                  className="w-20 bg-black/30 border-blue-500/20 text-white text-sm text-center"
                />
                <span className="text-xs text-gray-400">seconds</span>
              </div>
            )}

            {/* Brightness, Contrast & Chat Zoom */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Sun className="h-4 w-4 text-yellow-400 shrink-0" />
                <span className="text-xs text-gray-400 w-16">Brightness</span>
                <Slider
                  min={50}
                  max={200}
                  step={5}
                  value={[config?.brightness ?? 100]}
                  onValueChange={([v]) => save({ ...config!, brightness: v })}
                  className="flex-1"
                />
                <span className="text-xs text-white w-10 text-right">{config?.brightness ?? 100}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Contrast className="h-4 w-4 text-blue-400 shrink-0" />
                <span className="text-xs text-gray-400 w-16">Contrast</span>
                <Slider
                  min={50}
                  max={200}
                  step={5}
                  value={[config?.contrast ?? 100]}
                  onValueChange={([v]) => save({ ...config!, contrast: v })}
                  className="flex-1"
                />
                <span className="text-xs text-white w-10 text-right">{config?.contrast ?? 100}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Monitor className="h-4 w-4 text-green-400 shrink-0" />
                <span className="text-xs text-gray-400 w-16">Chat Zoom</span>
                <Slider
                  min={100}
                  max={300}
                  step={10}
                  value={[config?.chatZoom ?? 100]}
                  onValueChange={([v]) => save({ ...config!, chatZoom: v })}
                  className="flex-1"
                />
                <span className="text-xs text-white w-10 text-right">{config?.chatZoom ?? 100}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Monitor className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-xs text-gray-400 w-16">Chat Source</span>
                <div className="flex gap-1">
                  {(["restream", "discord"] as const).map((src) => (
                    <button
                      key={src}
                      onClick={() => save({ ...config!, chatSource: src })}
                      className={`px-3 py-1.5 rounded text-[10px] font-medium transition-colors capitalize ${
                        (config?.chatSource ?? "restream") === src
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                          : "bg-black/20 text-gray-500 hover:text-gray-300 border border-transparent"
                      }`}
                    >
                      {src}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Video feeds */}
            <div>
              <h3 className="text-xs font-semibold text-red-300/70 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Video className="h-3 w-3" /> Live Video Feeds
              </h3>

              {videoFeeds.length > 0 && (
                <div className="space-y-2 mb-3">
                  {videoFeeds.map((feed, i) => (
                    <div key={i} className="flex items-center gap-2 bg-black/20 rounded px-3 py-2">
                      <span className="text-white text-xs truncate flex-1">{feed.url}</span>
                      <div className="flex gap-1">
                        {PLACEMENT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => updateVideoPlacement(i, opt.value)}
                            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                              feed.placement === opt.value
                                ? "bg-red-500/30 text-red-300 border border-red-500/40"
                                : "bg-black/30 text-gray-500 hover:text-gray-300 border border-transparent"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => removeVideo(i)}
                        className="text-red-400/50 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="YouTube URL"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  className="bg-black/30 border-red-500/20 text-white placeholder:text-gray-500 flex-1 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && addVideo()}
                />
                <select
                  value={newVideoPlacement}
                  onChange={(e) => setNewVideoPlacement(e.target.value as VideoPlacement)}
                  className="bg-black/30 border border-red-500/20 text-white rounded px-2 text-xs"
                >
                  {PLACEMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={addVideo}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OutputControl;
