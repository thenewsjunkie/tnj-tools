import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { ArrowLeft, Upload, X, Download, RotateCcw, Film, Play, Pause } from "lucide-react";
import { transcodeVideoWithBorder, formatTime, VideoTranscodeProgress } from "@/utils/videoTranscode";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const borderPresets = [
  { label: "White", color: "#ffffff" },
  { label: "Black", color: "#000000" },
  { label: "Gold", color: "#d4a855" },
  { label: "Silver", color: "#c0c0c0" },
  { label: "Red", color: "#dc2626" },
  { label: "Blue", color: "#2563eb" },
];

const aspectRatios = [
  { label: "16:9", value: "16/9" },
  { label: "4:3", value: "4/3" },
  { label: "1:1", value: "1/1" },
  { label: "9:16", value: "9/16" },
  { label: "3:2", value: "3/2" },
];

const borderStyles = ["solid", "double", "groove", "ridge", "inset", "outset"];

const getShadowStyle = (intensity: string) => {
  switch (intensity) {
    case "light":
      return "0 4px 12px rgba(0,0,0,0.3)";
    case "medium":
      return "0 8px 24px rgba(0,0,0,0.5)";
    case "strong":
      return "0 12px 40px rgba(0,0,0,0.7)";
    default:
      return "";
  }
};

const InsertGenerator = () => {
  const navigate = useNavigate();
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Media state
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  // Frame state
  const [aspectRatio, setAspectRatio] = useState("16/9");
  const [frameWidth, setFrameWidth] = useState(480);
  const [objectFit, setObjectFit] = useState<"cover" | "contain" | "fill">("cover");

  // Border state
  const [borderSize, setBorderSize] = useState(4);
  const [borderColor, setBorderColor] = useState("#ffffff");
  const [borderStyle, setBorderStyle] = useState("solid");
  const [borderRadius, setBorderRadius] = useState(8);

  // Effects state
  const [shadowEnabled, setShadowEnabled] = useState(true);
  const [shadowIntensity, setShadowIntensity] = useState("medium");
  const [innerGlow, setInnerGlow] = useState(false);

  // Video trimming state
  const [videoDuration, setVideoDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Export state
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [exportProgress, setExportProgress] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      toast.error("Please upload an image or video file");
      return;
    }

    const url = URL.createObjectURL(file);
    setMediaUrl(url);
    setMediaType(isVideo ? "video" : "image");
    toast.success(`${isVideo ? "Video" : "Image"} uploaded`);
  };

  const handleClearMedia = () => {
    if (mediaUrl) {
      URL.revokeObjectURL(mediaUrl);
    }
    setMediaUrl("");
    setVideoDuration(0);
    setTrimStart(0);
    setTrimEnd(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle video metadata loaded
  const handleVideoLoaded = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      setVideoDuration(duration);
      setTrimEnd(duration);
    }
  };

  // Preview trimmed selection
  const handlePreviewSelection = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.currentTime = trimStart;
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Stop video at trim end
  useEffect(() => {
    const video = videoRef.current;
    if (!video || mediaType !== "video") return;

    const handleTimeUpdate = () => {
      if (video.currentTime >= trimEnd) {
        video.pause();
        video.currentTime = trimStart;
        setIsPlaying(false);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [trimStart, trimEnd, mediaType]);

  // Video export handler
  const handleDownloadVideo = async () => {
    if (!mediaUrl) return;

    setIsExportingVideo(true);
    setExportProgress("Loading...");

    try {
      const response = await fetch(mediaUrl);
      const videoBlob = await response.blob();

      await transcodeVideoWithBorder(
        videoBlob,
        {
          startTime: trimStart,
          endTime: trimEnd,
          borderSize,
          borderColor,
        },
        (progress: VideoTranscodeProgress) => {
          setExportProgress(progress.message);
        }
      ).then((outputBlob) => {
        const url = URL.createObjectURL(outputBlob);
        const link = document.createElement("a");
        link.download = `insert-video-${Date.now()}.webm`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Video exported!");
      });
    } catch (error) {
      console.error("Video export failed:", error);
      toast.error("Failed to export video");
    } finally {
      setIsExportingVideo(false);
      setExportProgress("");
    }
  };

  const handleReset = () => {
    handleClearMedia();
    setAspectRatio("16/9");
    setFrameWidth(480);
    setObjectFit("cover");
    setBorderSize(4);
    setBorderColor("#ffffff");
    setBorderStyle("solid");
    setBorderRadius(8);
    setShadowEnabled(true);
    setShadowIntensity("medium");
    setInnerGlow(false);
    toast.success("Reset to defaults");
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(previewRef.current, {
        backgroundColor: undefined,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `insert-frame-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Insert frame downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download");
    } finally {
      setIsDownloading(false);
    }
  };

  const frameStyle: React.CSSProperties = {
    width: frameWidth,
    aspectRatio: aspectRatio,
    border: borderSize > 0 ? `${borderSize}px ${borderStyle} ${borderColor}` : "none",
    borderRadius: `${borderRadius}px`,
    boxShadow: [
      shadowEnabled ? getShadowStyle(shadowIntensity) : "",
      innerGlow ? "inset 0 0 20px rgba(255,255,255,0.2)" : "",
    ]
      .filter(Boolean)
      .join(", ") || "none",
    overflow: "hidden",
    background: "transparent",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Insert Generator</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-lg border border-border p-4">
              <Label className="text-sm font-medium mb-3 block">Preview</Label>
              
              {/* Checkerboard background container */}
              <div
                className="flex items-center justify-center p-8 rounded-lg min-h-[400px]"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%),
                    linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%),
                    linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)
                  `,
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                }}
              >
                {/* The actual frame to export */}
                <div ref={previewRef} style={frameStyle}>
                  {mediaUrl ? (
                    mediaType === "video" ? (
                      <video
                        ref={videoRef}
                        src={mediaUrl}
                        className="w-full h-full"
                        style={{ objectFit }}
                        muted
                        playsInline
                        onLoadedMetadata={handleVideoLoaded}
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt="Insert preview"
                        className="w-full h-full"
                        style={{ objectFit }}
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/50 text-muted-foreground">
                      <div className="text-center">
                        <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Upload media to preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Position Preview Thumbnails */}
            <div className="bg-card rounded-lg border border-border p-4">
              <Label className="text-sm font-medium mb-3 block">Position Preview</Label>
              <div className="grid grid-cols-4 gap-3">
                {["Top Left", "Top Right", "Bottom Left", "Bottom Right"].map((pos, idx) => (
                  <div
                    key={pos}
                    className="aspect-video bg-muted rounded border border-border relative overflow-hidden"
                  >
                    <div
                      className="absolute"
                      style={{
                        width: "30%",
                        aspectRatio,
                        border: `2px ${borderStyle} ${borderColor}`,
                        borderRadius: `${Math.min(borderRadius, 4)}px`,
                        ...(idx === 0 && { top: 8, left: 8 }),
                        ...(idx === 1 && { top: 8, right: 8 }),
                        ...(idx === 2 && { bottom: 8, left: 8 }),
                        ...(idx === 3 && { bottom: 8, right: 8 }),
                        background: mediaUrl ? `url(${mediaUrl}) center/cover` : "hsl(var(--primary)/0.3)",
                      }}
                    />
                    <span className="absolute bottom-1 left-1 text-[10px] text-muted-foreground">
                      {pos}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="space-y-4">
            {/* Media Upload */}
            <div className="bg-card rounded-lg border border-border p-4 space-y-3">
              <Label className="text-sm font-semibold">Media</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                {mediaUrl && (
                  <Button variant="outline" size="icon" onClick={handleClearMedia}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Supports images (jpg, png, webp, gif) and videos (mp4, webm, mov)
              </p>
            </div>

            {/* Video Trimming - only shown when video is uploaded */}
            {mediaType === "video" && videoDuration > 0 && (
              <div className="bg-card rounded-lg border border-border p-4 space-y-4">
                <Label className="text-sm font-semibold">Video Trimming</Label>
                
                <div className="text-xs text-muted-foreground">
                  Duration: {formatTime(videoDuration)}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">Start Time</Label>
                    <span className="text-xs text-muted-foreground">{formatTime(trimStart)}</span>
                  </div>
                  <Slider
                    value={[trimStart]}
                    onValueChange={(v) => {
                      const newStart = v[0];
                      setTrimStart(newStart);
                      if (newStart >= trimEnd) {
                        setTrimEnd(Math.min(newStart + 0.1, videoDuration));
                      }
                    }}
                    min={0}
                    max={videoDuration}
                    step={0.1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-xs">End Time</Label>
                    <span className="text-xs text-muted-foreground">{formatTime(trimEnd)}</span>
                  </div>
                  <Slider
                    value={[trimEnd]}
                    onValueChange={(v) => {
                      const newEnd = v[0];
                      setTrimEnd(newEnd);
                      if (newEnd <= trimStart) {
                        setTrimStart(Math.max(newEnd - 0.1, 0));
                      }
                    }}
                    min={0}
                    max={videoDuration}
                    step={0.1}
                  />
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Selected: {formatTime(trimEnd - trimStart)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviewSelection}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Preview
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Frame Settings */}
            <div className="bg-card rounded-lg border border-border p-4 space-y-4">
              <Label className="text-sm font-semibold">Frame</Label>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs">Aspect Ratio</Label>
                </div>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aspectRatios.map((ar) => (
                      <SelectItem key={ar.value} value={ar.value}>
                        {ar.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs">Width</Label>
                  <span className="text-xs text-muted-foreground">{frameWidth}px</span>
                </div>
                <Slider
                  value={[frameWidth]}
                  onValueChange={(v) => setFrameWidth(v[0])}
                  min={200}
                  max={800}
                  step={10}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Object Fit</Label>
                <Select value={objectFit} onValueChange={(v: "cover" | "contain" | "fill") => setObjectFit(v)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Cover</SelectItem>
                    <SelectItem value="contain">Contain</SelectItem>
                    <SelectItem value="fill">Fill</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Border Controls */}
            <div className="bg-card rounded-lg border border-border p-4 space-y-4">
              <Label className="text-sm font-semibold">Border</Label>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs">Size</Label>
                  <span className="text-xs text-muted-foreground">{borderSize}px</span>
                </div>
                <Slider
                  value={[borderSize]}
                  onValueChange={(v) => setBorderSize(v[0])}
                  min={0}
                  max={20}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Color</Label>
                <div className="flex gap-1 flex-wrap">
                  {borderPresets.map((preset) => (
                    <button
                      key={preset.color}
                      className={`w-7 h-7 rounded border-2 transition-all ${
                        borderColor === preset.color
                          ? "border-primary scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: preset.color }}
                      onClick={() => setBorderColor(preset.color)}
                      title={preset.label}
                    />
                  ))}
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0"
                    title="Custom color"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Style</Label>
                <Select value={borderStyle} onValueChange={setBorderStyle}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {borderStyles.map((style) => (
                      <SelectItem key={style} value={style} className="capitalize">
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs">Radius</Label>
                  <span className="text-xs text-muted-foreground">{borderRadius}px</span>
                </div>
                <Slider
                  value={[borderRadius]}
                  onValueChange={(v) => setBorderRadius(v[0])}
                  min={0}
                  max={50}
                  step={1}
                />
              </div>
            </div>

            {/* Effects */}
            <div className="bg-card rounded-lg border border-border p-4 space-y-4">
              <Label className="text-sm font-semibold">Effects</Label>

              <div className="flex items-center justify-between">
                <Label className="text-xs">Drop Shadow</Label>
                <Switch checked={shadowEnabled} onCheckedChange={setShadowEnabled} />
              </div>

              {shadowEnabled && (
                <div className="space-y-2">
                  <Label className="text-xs">Shadow Intensity</Label>
                  <Select value={shadowIntensity} onValueChange={setShadowIntensity}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="strong">Strong</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label className="text-xs">Inner Glow</Label>
                <Switch checked={innerGlow} onCheckedChange={setInnerGlow} />
              </div>
            </div>

            {/* Export */}
            <div className="bg-card rounded-lg border border-border p-4 space-y-3">
              <Label className="text-sm font-semibold">Export</Label>
              
              <Button
                className="w-full"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? "Downloading..." : "Download PNG"}
              </Button>

              {mediaType === "video" && videoDuration > 0 && (
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={handleDownloadVideo}
                  disabled={isExportingVideo}
                >
                  <Film className="h-4 w-4 mr-2" />
                  {isExportingVideo ? exportProgress : "Download Video (WebM)"}
                </Button>
              )}

              <p className="text-xs text-muted-foreground">
                {mediaType === "video" && videoDuration > 0
                  ? "Video exports as WebM with border, no audio"
                  : "Exports with transparent background"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsertGenerator;
