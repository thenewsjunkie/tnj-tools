import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, RotateCcw, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LayoutStyle = "standard" | "localNews" | "breakingNews" | "compact";
type ColorScheme = "red" | "blue" | "purple" | "green" | "orange" | "studioDark";
type OutputSize = "compact" | "standard" | "tall";

const colorSchemes: Record<ColorScheme, { primary: string; secondary: string; accent: string; solid: string }> = {
  red: {
    primary: "linear-gradient(135deg, #8B0000 0%, #B22222 50%, #DC143C 100%)",
    secondary: "#1a1a1a",
    accent: "#DC143C",
    solid: "#B22222",
  },
  blue: {
    primary: "linear-gradient(135deg, #0a2463 0%, #1e3a8a 50%, #1d4ed8 100%)",
    secondary: "#0f172a",
    accent: "#3b82f6",
    solid: "#1e3a8a",
  },
  purple: {
    primary: "linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)",
    secondary: "#1e1b4b",
    accent: "#8b5cf6",
    solid: "#6d28d9",
  },
  green: {
    primary: "linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)",
    secondary: "#022c22",
    accent: "#34d399",
    solid: "#047857",
  },
  orange: {
    primary: "linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #f97316 100%)",
    secondary: "#1a1a1a",
    accent: "#f97316",
    solid: "#ea580c",
  },
  studioDark: {
    primary: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #3a3a3a 100%)",
    secondary: "#0d0d0d",
    accent: "#d4a855",
    solid: "#1f1f1f",
  },
};

const sizeHeights: Record<OutputSize, number> = {
  compact: 180,
  standard: 260,
  tall: 340,
};

// Output dimensions - single source of truth
const OUTPUT_WIDTH = 1920;

const LowerThirdGenerator = () => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>("compact");
  const [outputSize, setOutputSize] = useState<OutputSize>("compact");
  const [headline1, setHeadline1] = useState("BREAKING NEWS HEADLINE");
  const [headline2, setHeadline2] = useState("Second line of the headline goes here");
  const [showName, setShowName] = useState("THE NEWS JUNKIE");
  const [handle, setHandle] = useState("@TNJSHOW");
  const [websiteUrl, setWebsiteUrl] = useState("THENEWSJUNKIE.COM");
  const [colorScheme, setColorScheme] = useState<ColorScheme>("studioDark");
  const [tagText, setTagText] = useState("NEW AT 5PM");
  const [labelText, setLabelText] = useState("BREAKING NEWS");

  const colors = colorSchemes[colorScheme];
  const outputHeight = sizeHeights[outputSize];

  const handleDownload = async () => {
    if (!previewRef.current) return;
    
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(previewRef.current, {
        backgroundColor: "transparent",
        pixelRatio: 2,
        width: OUTPUT_WIDTH,
        height: outputHeight,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });
      
      const link = document.createElement("a");
      link.download = `lower-third-${layoutStyle}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success("Lower third downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download lower third");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setLayoutStyle("compact");
    setOutputSize("compact");
    setHeadline1("BREAKING NEWS HEADLINE");
    setHeadline2("Second line of the headline goes here");
    setShowName("THE NEWS JUNKIE");
    setHandle("@TNJSHOW");
    setWebsiteUrl("THENEWSJUNKIE.COM");
    setColorScheme("studioDark");
    setTagText("NEW AT 5PM");
    setLabelText("BREAKING NEWS");
    toast.success("Reset to defaults");
  };

  const renderStandardLayout = () => (
    <div className="absolute inset-0 flex flex-col justify-end" style={{ overflow: 'visible' }}>
      {/* Headline Bar */}
      <div
        className="flex items-center relative"
        style={{
          background: colors.primary,
          padding: "20px 28px",
          borderLeft: `6px solid ${colors.accent}`,
        }}
      >
        <div className="flex-1 min-w-0">
          <h1
            className="font-extrabold text-white leading-tight tracking-tight truncate"
            style={{
              fontSize: "clamp(18px, 4vw, 36px)",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
            }}
          >
            {headline1 || "HEADLINE TEXT"}
          </h1>
          {headline2 && (
            <p
              className="text-white/90 font-medium truncate"
              style={{
                fontSize: "clamp(12px, 2vw, 20px)",
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
              }}
            >
              {headline2}
            </p>
          )}
        </div>
      </div>

      {/* Secondary Bar */}
      <div
        className="flex items-center justify-between"
        style={{
          background: colors.secondary,
          padding: "10px 28px",
        }}
      >
        <div
          className="font-bold text-white tracking-wide"
          style={{
            fontSize: "clamp(10px, 1.8vw, 16px)",
            fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
          }}
        >
          {showName}
          {handle && (
            <span
              className="ml-3 font-normal"
              style={{ color: colors.accent }}
            >
              {handle}
            </span>
          )}
        </div>
        <div
          className="font-bold tracking-wider"
          style={{
            fontSize: "clamp(10px, 1.8vw, 16px)",
            color: colors.accent,
            fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
          }}
        >
          {websiteUrl}
        </div>
      </div>
    </div>
  );

  const renderLocalNewsLayout = () => (
    <div className="absolute inset-0 flex flex-col justify-end" style={{ overflow: 'visible' }}>
      {/* Small Tag Above */}
      <div className="flex">
        <div
          style={{
            background: colors.accent,
            padding: "6px 16px",
            fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
          }}
        >
          <span
            className="font-bold text-white tracking-wide"
            style={{
              fontSize: "clamp(10px, 1.5vw, 14px)",
              textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            {tagText || "NEW AT 5PM"}
          </span>
        </div>
      </div>

      {/* Main Headline Bar - Solid Color */}
      <div
        className="flex items-center"
        style={{
          background: colors.solid,
          padding: "20px 28px",
        }}
      >
        <div className="flex-1 min-w-0">
          <h1
            className="font-extrabold text-white leading-tight tracking-tight truncate"
            style={{
              fontSize: "clamp(18px, 4vw, 36px)",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
            }}
          >
            {headline1 || "HEADLINE TEXT"}
          </h1>
          {headline2 && (
            <p
              className="text-white/90 font-medium truncate"
              style={{
                fontSize: "clamp(12px, 2vw, 20px)",
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
              }}
            >
              {headline2}
            </p>
          )}
        </div>
      </div>

      {/* Secondary Bar */}
      <div
        className="flex items-center justify-between"
        style={{
          background: colors.secondary,
          padding: "10px 28px",
        }}
      >
        <div
          className="font-bold text-white tracking-wide"
          style={{
            fontSize: "clamp(10px, 1.8vw, 16px)",
            fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
          }}
        >
          {showName}
        </div>
        <div
          className="font-bold tracking-wider"
          style={{
            fontSize: "clamp(10px, 1.8vw, 16px)",
            color: colors.accent,
            fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
          }}
        >
          {websiteUrl}
        </div>
      </div>
    </div>
  );

  const renderBreakingNewsLayout = () => (
    <div className="absolute inset-0 flex flex-col justify-end" style={{ overflow: 'visible' }}>
      <div className="flex">
        {/* Label Box on Left */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            background: colors.accent,
            padding: "20px 24px",
            minWidth: "180px",
          }}
        >
          <span
            className="font-black text-white tracking-wider text-center leading-tight"
            style={{
              fontSize: "clamp(14px, 2.5vw, 22px)",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
            }}
          >
            {labelText || "BREAKING NEWS"}
          </span>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Headline Area */}
          <div
            className="flex-1 flex items-center"
            style={{
              background: colors.solid,
              padding: "16px 28px",
            }}
          >
            <div className="flex-1 min-w-0">
              <h1
                className="font-extrabold text-white leading-tight tracking-tight truncate"
                style={{
                  fontSize: "clamp(16px, 3.5vw, 32px)",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
                }}
              >
                {headline1 || "HEADLINE TEXT"}
              </h1>
              {headline2 && (
                <p
                  className="text-white/90 font-medium truncate mt-1"
                  style={{
                    fontSize: "clamp(11px, 1.8vw, 18px)",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
                  }}
                >
                  {headline2}
                </p>
              )}
            </div>
          </div>

          {/* Secondary Bar */}
          <div
            className="flex items-center justify-between"
            style={{
              background: colors.secondary,
              padding: "10px 28px",
            }}
          >
            <div
              className="font-bold text-white tracking-wide"
              style={{
                fontSize: "clamp(10px, 1.8vw, 16px)",
                fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
              }}
            >
              {showName}
            </div>
            <div
              className="font-bold tracking-wider"
              style={{
                fontSize: "clamp(10px, 1.8vw, 16px)",
                color: colors.accent,
                fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
              }}
            >
              {websiteUrl}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompactLayout = () => (
    <div className="absolute inset-0 flex flex-col justify-end" style={{ overflow: 'visible' }}>
      <div
        className="flex items-center"
        style={{
          background: `${colors.secondary}e6`,
          borderLeft: `4px solid ${colors.accent}`,
        }}
      >
        {/* Main Content */}
        <div className="flex-1 py-3 px-5">
          <h1
            className="font-bold text-white leading-tight tracking-tight truncate"
            style={{
              fontSize: "clamp(14px, 3vw, 28px)",
              textShadow: "1px 1px 3px rgba(0,0,0,0.6)",
              fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
            }}
          >
            {headline1 || "HEADLINE TEXT"}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            {headline2 && (
              <span
                className="text-white/80 font-normal truncate"
                style={{
                  fontSize: "clamp(10px, 1.5vw, 14px)",
                  fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
                }}
              >
                {headline2}
              </span>
            )}
            <span className="text-white/40">•</span>
            <span
              className="font-semibold shrink-0"
              style={{
                fontSize: "clamp(9px, 1.3vw, 12px)",
                color: colors.accent,
                fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
              }}
            >
              {showName}
            </span>
            {websiteUrl && (
              <>
                <span className="text-white/40">•</span>
                <span
                  className="font-medium shrink-0"
                  style={{
                    fontSize: "clamp(9px, 1.3vw, 12px)",
                    color: colors.accent,
                    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
                  }}
                >
                  {websiteUrl}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Lower Third Generator</h1>
              <p className="text-muted-foreground text-sm">
                Create broadcast-quality lower thirds with transparent backgrounds
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleDownload} disabled={isDownloading}>
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? "Downloading..." : "Download PNG"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Edit Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Output Size Selector */}
              <div className="space-y-2">
                <Label>Output Size</Label>
                <Select value={outputSize} onValueChange={(v) => setOutputSize(v as OutputSize)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">
                      <span>Compact (160px)</span>
                    </SelectItem>
                    <SelectItem value="standard">
                      <span>Standard (260px)</span>
                    </SelectItem>
                    <SelectItem value="tall">
                      <span>Tall (340px)</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Layout Style Selector */}
              <div className="space-y-2">
                <Label>Layout Style</Label>
                <Select value={layoutStyle} onValueChange={(v) => setLayoutStyle(v as LayoutStyle)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">
                      <span>Compact (Minimal)</span>
                    </SelectItem>
                    <SelectItem value="standard">
                      <span>Standard (Gradient Bar)</span>
                    </SelectItem>
                    <SelectItem value="localNews">
                      <span>Local News (Tag + Solid)</span>
                    </SelectItem>
                    <SelectItem value="breakingNews">
                      <span>Breaking News (Label Box)</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Conditional Tag Text for Local News */}
              {layoutStyle === "localNews" && (
                <div className="space-y-2">
                  <Label htmlFor="tagText">Tag Text</Label>
                  <Input
                    id="tagText"
                    value={tagText}
                    onChange={(e) => setTagText(e.target.value.toUpperCase())}
                    placeholder="NEW AT 5PM"
                    className="font-bold"
                  />
                </div>
              )}

              {/* Conditional Label Text for Breaking News */}
              {layoutStyle === "breakingNews" && (
                <div className="space-y-2">
                  <Label htmlFor="labelText">Label Text</Label>
                  <Input
                    id="labelText"
                    value={labelText}
                    onChange={(e) => setLabelText(e.target.value.toUpperCase())}
                    placeholder="BREAKING NEWS"
                    className="font-bold"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="headline1">Headline Line 1</Label>
                <Input
                  id="headline1"
                  value={headline1}
                  onChange={(e) => setHeadline1(e.target.value.toUpperCase())}
                  placeholder="Main headline..."
                  className="font-bold"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="headline2">Headline Line 2</Label>
                <Input
                  id="headline2"
                  value={headline2}
                  onChange={(e) => setHeadline2(e.target.value)}
                  placeholder="Secondary text..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="showName">Show Name</Label>
                  <Input
                    id="showName"
                    value={showName}
                    onChange={(e) => setShowName(e.target.value.toUpperCase())}
                    placeholder="SHOW NAME"
                  />
                </div>
                {layoutStyle === "standard" && (
                  <div className="space-y-2">
                    <Label htmlFor="handle">Handle</Label>
                    <Input
                      id="handle"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value.toUpperCase())}
                      placeholder="@HANDLE"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value.toUpperCase())}
                  placeholder="YOURSITE.COM"
                />
              </div>

              <div className="space-y-2">
                <Label>Color Scheme</Label>
                <Select value={colorScheme} onValueChange={(v) => setColorScheme(v as ColorScheme)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="studioDark">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ background: "linear-gradient(135deg, #1a1a1a, #d4a855)" }} />
                        <span>Studio Dark (Amber)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="red">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-600" />
                        <span>Red (CNN Style)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="blue">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-600" />
                        <span>Blue (News Style)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="purple">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-purple-600" />
                        <span>Purple (TNJ Style)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="green">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-600" />
                        <span>Green (Eco Style)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="orange">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-orange-600" />
                        <span>Orange (Alert Style)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Checkered background to show transparency */}
              <div 
                className="rounded-lg overflow-hidden"
                style={{
                  background: `
                    repeating-conic-gradient(#e5e7eb 0% 25%, #f3f4f6 0% 50%) 
                    50% / 20px 20px
                  `,
                }}
              >
                {/* Actual Lower Third Preview */}
                <div
                  ref={previewRef}
                  className="relative"
                  style={{
                    width: "100%",
                    maxWidth: "960px",
                    aspectRatio: `${OUTPUT_WIDTH} / ${outputHeight}`,
                    margin: "0 auto",
                  }}
                >
                  {layoutStyle === "compact" && renderCompactLayout()}
                  {layoutStyle === "standard" && renderStandardLayout()}
                  {layoutStyle === "localNews" && renderLocalNewsLayout()}
                  {layoutStyle === "breakingNews" && renderBreakingNewsLayout()}
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Preview shown on checkered background to indicate transparency. 
                Downloaded image will have a transparent background.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Choose your layout</p>
                  <p className="text-muted-foreground">Select a layout style that fits your broadcast</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Edit your content</p>
                  <p className="text-muted-foreground">Fill in headlines and pick your color scheme</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Download & overlay</p>
                  <p className="text-muted-foreground">Add the transparent PNG to your video editor</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LowerThirdGenerator;
