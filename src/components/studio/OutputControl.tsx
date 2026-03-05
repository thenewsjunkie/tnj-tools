import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Monitor, ExternalLink, Plus, Trash2, Video, Maximize, Clock, Pencil, Check, X, Lock, Unlock } from "lucide-react";
import { Slider } from "@/components/ui/slider";

import { Link } from "react-router-dom";
import {
  useOutputConfig,
  useUpdateOutputConfig,
  STUDIO_MODULES,
  StudioModule,
  VideoPlacement,
  VideoFeed,
  VdoNinjaFeed,
  OverlayPosition,
  getYouTubeEmbedUrl,
  getVdoNinjaEmbedUrl,
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
  const [newVdoUrl, setNewVdoUrl] = useState("");
  const [newVdoPlacement, setNewVdoPlacement] = useState<VideoPlacement>("center");
  const [editingVdoUrl, setEditingVdoUrl] = useState<number | null>(null);
  const [tempVdoUrl, setTempVdoUrl] = useState("");

  const leftColumn = config?.leftColumn ?? [];
  const rightColumn = config?.rightColumn ?? [];
  const videoFeeds = config?.videoFeeds ?? [];
  const vdoNinjaFeeds = config?.vdoNinjaFeeds ?? [];
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

  const updateVideoWidth = (index: number, width: number) => {
    if (!config) return;
    const newFeeds = videoFeeds.map((f, i) => (i === index ? { ...f, width } : f));
    save({ ...config, videoFeeds: newFeeds });
  };

  // VDO.Ninja feed management
  const addVdoFeed = () => {
    if (!config) return;
    const trimmed = newVdoUrl.trim();
    if (!trimmed) return;
    const embedUrl = getVdoNinjaEmbedUrl(trimmed);
    if (!embedUrl) {
      toast.error("Invalid VDO.Ninja URL");
      return;
    }
    const newFeeds: VdoNinjaFeed[] = [...vdoNinjaFeeds, { url: trimmed, placement: newVdoPlacement }];
    save({ ...config, vdoNinjaFeeds: newFeeds });
    setNewVdoUrl("");
    toast.success("VDO.Ninja feed added");
  };

  const removeVdoFeed = (index: number) => {
    if (!config) return;
    const newFeeds = vdoNinjaFeeds.filter((_, i) => i !== index);
    save({ ...config, vdoNinjaFeeds: newFeeds });
    toast.success("VDO.Ninja feed removed");
  };

  const updateVdoPlacement = (index: number, placement: VideoPlacement) => {
    if (!config) return;
    const newFeeds = vdoNinjaFeeds.map((f, i) => (i === index ? { ...f, placement } : f));
    save({ ...config, vdoNinjaFeeds: newFeeds });
  };

  const updateVdoWidth = (index: number, width: number) => {
    if (!config) return;
    const newFeeds = vdoNinjaFeeds.map((f, i) => (i === index ? { ...f, width } : f));
    save({ ...config, vdoNinjaFeeds: newFeeds });
  };

  const updateVdoCrop = (index: number, field: "cropTop" | "cropBottom" | "cropLeft" | "cropRight", value: number) => {
    if (!config) return;
    const newFeeds = vdoNinjaFeeds.map((f, i) => (i === index ? { ...f, [field]: value } : f));
    save({ ...config, vdoNinjaFeeds: newFeeds });
  };

  const startEditingVdoUrl = (index: number) => {
    setEditingVdoUrl(index);
    setTempVdoUrl(vdoNinjaFeeds[index].url);
  };

  const saveVdoUrl = (index: number) => {
    if (!config || !tempVdoUrl.trim()) return;
    const embedUrl = getVdoNinjaEmbedUrl(tempVdoUrl.trim());
    if (!embedUrl) {
      toast.error("Invalid VDO.Ninja URL");
      return;
    }
    const newFeeds = vdoNinjaFeeds.map((f, i) => (i === index ? { ...f, url: tempVdoUrl.trim() } : f));
    save({ ...config, vdoNinjaFeeds: newFeeds });
    setEditingVdoUrl(null);
    toast.success("VDO.Ninja URL updated");
  };

  const cancelEditingVdoUrl = () => {
    setEditingVdoUrl(null);
    setTempVdoUrl("");
  };

  const updateVdoEnabled = (index: number, enabled: boolean) => {
    if (!config) return;
    const newFeeds = vdoNinjaFeeds.map((f, i) => (i === index ? { ...f, enabled } : f));
    save({ ...config, vdoNinjaFeeds: newFeeds });
  };

  const updateVdoLocked = (index: number, locked: boolean) => {
    if (!config) return;
    const newFeeds = vdoNinjaFeeds.map((f, i) => (i === index ? { ...f, locked } : f));
    save({ ...config, vdoNinjaFeeds: newFeeds });
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

            {/* Layout + Rotation */}
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
              <div className="w-px h-5 bg-blue-500/20" />
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
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                Rotate Left
                <Switch checked={!!config?.leftRotate} onCheckedChange={() => toggleRotate("left")} className="scale-75" />
              </span>
              <span className="flex items-center gap-1.5">
                Rotate Right
                <Switch checked={!!config?.rightRotate} onCheckedChange={() => toggleRotate("right")} className="scale-75" />
              </span>
              <div className="w-px h-5 bg-blue-500/20" />
              <span className={`flex items-center gap-1.5 ${!anyRotateEnabled ? 'opacity-40' : ''}`}>
                Every
                <Input
                  type="number"
                  min={5}
                  value={config?.rotateInterval ?? 30}
                  onChange={(e) => updateRotateInterval(Number(e.target.value))}
                  disabled={!anyRotateEnabled}
                  className="w-14 h-7 bg-black/30 border-blue-500/20 text-white text-xs text-center"
                />
                sec
              </span>
            </div>

            {/* Chat Source + Chat Zoom */}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="text-xs font-semibold text-blue-300/70 uppercase tracking-wider whitespace-nowrap">Chat Source</span>
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
              <div className="w-px h-5 bg-blue-500/20" />
              <span className="text-xs text-gray-400 whitespace-nowrap">Zoom</span>
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

            {/* Video feeds */}
            <div>
              <h3 className="text-xs font-semibold text-red-300/70 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Video className="h-3 w-3" /> Live Video Feeds
              </h3>

              {videoFeeds.length > 0 && (
                <div className="space-y-2 mb-3">
                  {videoFeeds.map((feed, i) => (
                    <div key={i} className="bg-black/20 rounded px-3 py-2 space-y-1.5">
                      <div className="flex items-center gap-2">
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
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 w-8">Size</span>
                        <Slider
                          min={320}
                          max={1920}
                          step={10}
                          value={[feed.width ?? 1280]}
                          onValueChange={([v]) => updateVideoWidth(i, v)}
                          className="flex-1"
                        />
                        <span className="text-[10px] text-white w-12 text-right">{feed.width ?? 1280}px</span>
                      </div>
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

            {/* VDO.Ninja Feeds */}
            <div>
              <h3 className="text-xs font-semibold text-purple-300/70 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Video className="h-3 w-3" /> VDO.Ninja Feeds
              </h3>

              {vdoNinjaFeeds.length > 0 && (
                <div className="space-y-2 mb-3">
                  {vdoNinjaFeeds.map((feed, i) => {
                    const isLocked = !!feed.locked;
                    const isEnabled = feed.enabled !== false;
                    const lockedClass = isLocked ? "opacity-40 pointer-events-none" : "";
                    return (
                    <div key={i} className={`bg-black/20 rounded px-3 py-2 space-y-1.5 ${!isEnabled ? "opacity-50" : ""}`}>
                      {/* Header row: switch, URL, lock, placements, delete */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) => updateVdoEnabled(i, checked)}
                          className="scale-75 shrink-0"
                        />
                        {editingVdoUrl === i ? (
                          <div className={`flex items-center gap-2 flex-1 ${lockedClass}`}>
                            <Input
                              value={tempVdoUrl}
                              onChange={(e) => setTempVdoUrl(e.target.value)}
                              className="bg-black/30 border-purple-500/20 text-white text-xs flex-1 h-7"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveVdoUrl(i);
                                if (e.key === "Escape") cancelEditingVdoUrl();
                              }}
                            />
                            <button onClick={() => saveVdoUrl(i)} className="text-green-400 hover:text-green-300">
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={cancelEditingVdoUrl} className="text-red-400 hover:text-red-300">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-white text-xs truncate flex-1">{feed.url}</span>
                            <button
                              onClick={() => startEditingVdoUrl(i)}
                              className={`text-gray-500 hover:text-purple-300 transition-colors ${lockedClass}`}
                              title="Edit URL"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => updateVdoLocked(i, !isLocked)}
                          className={`transition-colors shrink-0 ${isLocked ? "text-yellow-400 hover:text-yellow-300" : "text-gray-500 hover:text-gray-300"}`}
                          title={isLocked ? "Unlock settings" : "Lock settings"}
                        >
                          {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                        </button>
                        <div className={`flex gap-1 ${lockedClass}`}>
                          {PLACEMENT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => updateVdoPlacement(i, opt.value)}
                              className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                                feed.placement === opt.value
                                  ? "bg-purple-500/30 text-purple-300 border border-purple-500/40"
                                  : "bg-black/30 text-gray-500 hover:text-gray-300 border border-transparent"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => removeVdoFeed(i)}
                          className={`text-purple-400/50 hover:text-purple-400 transition-colors ${lockedClass}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className={`flex items-center gap-2 ${lockedClass}`}>
                        <span className="text-[10px] text-gray-500 w-8">Size</span>
                        <Slider
                          min={320}
                          max={1920}
                          step={10}
                          value={[feed.width ?? 1280]}
                          onValueChange={([v]) => updateVdoWidth(i, v)}
                          className="flex-1"
                        />
                        <span className="text-[10px] text-white w-12 text-right">{feed.width ?? 1280}px</span>
                      </div>
                      {/* Crop controls */}
                      <div className={`grid grid-cols-2 gap-x-3 gap-y-1 ${lockedClass}`}>
                        {(["cropTop", "cropBottom", "cropLeft", "cropRight"] as const).map((field) => (
                          <div key={field} className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-500 w-10 capitalize">{field.replace("crop", "")}</span>
                            <Slider
                              min={0}
                              max={50}
                              step={1}
                              value={[feed[field] ?? 0]}
                              onValueChange={([v]) => updateVdoCrop(i, field, v)}
                              className="flex-1"
                            />
                            <span className="text-[10px] text-white w-8 text-right">{feed[field] ?? 0}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="VDO.Ninja URL"
                  value={newVdoUrl}
                  onChange={(e) => setNewVdoUrl(e.target.value)}
                  className="bg-black/30 border-purple-500/20 text-white placeholder:text-gray-500 flex-1 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && addVdoFeed()}
                />
                <select
                  value={newVdoPlacement}
                  onChange={(e) => setNewVdoPlacement(e.target.value as VideoPlacement)}
                  className="bg-black/30 border border-purple-500/20 text-white rounded px-2 text-xs"
                >
                  {PLACEMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={addVdoFeed}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Overlays */}
            <div>
              <h3 className="text-xs font-semibold text-yellow-300/70 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Overlays
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  Clock
                  <Switch
                    checked={!!config?.overlays?.clock?.enabled}
                    onCheckedChange={(checked) =>
                      save({
                        ...config!,
                        overlays: {
                          ...config!.overlays,
                          clock: { enabled: checked, position: config?.overlays?.clock?.position ?? "top-left" },
                        },
                      })
                    }
                    className="scale-75"
                  />
                </span>
                <div className="w-px h-5 bg-blue-500/20" />
                <div className={`flex gap-1 ${!config?.overlays?.clock?.enabled ? "opacity-40 pointer-events-none" : ""}`}>
                  {(["top-left", "top-right", "bottom-left", "bottom-right"] as OverlayPosition[]).map((pos) => (
                    <button
                      key={pos}
                      onClick={() =>
                        save({
                          ...config!,
                          overlays: {
                            ...config!.overlays,
                            clock: { enabled: true, position: pos },
                          },
                        })
                      }
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-colors capitalize ${
                        (config?.overlays?.clock?.position ?? "top-left") === pos
                          ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                          : "bg-black/20 text-gray-500 hover:text-gray-300 border border-transparent"
                      }`}
                    >
                      {pos.replace("-", " ")}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OutputControl;
