import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Monitor, ArrowLeft, ArrowRight, ExternalLink, Plus, Trash2, Video } from "lucide-react";
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
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "full", label: "Full Width" },
  { value: "pip", label: "PiP" },
];

const OutputControl = () => {
  const { data: config, isLoading } = useOutputConfig();
  const updateConfig = useUpdateOutputConfig();
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoPlacement, setNewVideoPlacement] = useState<VideoPlacement>("full");

  const leftColumn = config?.leftColumn ?? [];
  const rightColumn = config?.rightColumn ?? [];
  const videoFeeds = config?.videoFeeds ?? [];

  const isInLeft = (id: StudioModule) => leftColumn.includes(id);
  const isInRight = (id: StudioModule) => rightColumn.includes(id);

  const save = (newConfig: typeof config) => {
    if (!newConfig) return;
    updateConfig.mutate(newConfig, {
      onError: (err: any) => toast.error(err.message),
    });
  };

  const toggleModule = (id: StudioModule, column: "left" | "right") => {
    if (!config) return;
    const newConfig = { ...config };

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
            {/* Module columns */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-semibold text-blue-300/70 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> Left Column
                  <span className="ml-auto flex items-center gap-1.5 normal-case tracking-normal">
                    <span className="text-[10px] text-gray-400">Rotate</span>
                    <Switch
                      checked={!!config?.leftRotate}
                      onCheckedChange={() => toggleRotate("left")}
                      className="scale-75"
                    />
                  </span>
                </h3>
                <div className="space-y-1.5">
                  {STUDIO_MODULES.map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => toggleModule(mod.id, "left")}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        isInLeft(mod.id)
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          : "bg-black/20 text-gray-400 hover:bg-black/30 border border-transparent"
                      }`}
                    >
                      {mod.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-blue-300/70 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" /> Right Column
                  <span className="ml-auto flex items-center gap-1.5 normal-case tracking-normal">
                    <span className="text-[10px] text-gray-400">Rotate</span>
                    <Switch
                      checked={!!config?.rightRotate}
                      onCheckedChange={() => toggleRotate("right")}
                      className="scale-75"
                    />
                  </span>
                </h3>
                <div className="space-y-1.5">
                  {STUDIO_MODULES.map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => toggleModule(mod.id, "right")}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        isInRight(mod.id)
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          : "bg-black/20 text-gray-400 hover:bg-black/30 border border-transparent"
                      }`}
                    >
                      {mod.label}
                    </button>
                  ))}
                </div>
              </div>
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

            {/* Video feeds */}
            <div>
              <h3 className="text-xs font-semibold text-red-300/70 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Video className="h-3 w-3" /> Live Video Feeds
              </h3>

              {/* Existing feeds */}
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

              {/* Add new feed */}
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
