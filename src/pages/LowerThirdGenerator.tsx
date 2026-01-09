import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, RotateCcw, ArrowLeft, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LayoutStyle = "standard" | "localNews" | "breakingNews" | "compact";
type ColorScheme = "red" | "blue" | "purple" | "green" | "orange" | "studioDark" | "woodGrain" | "custom";
type OutputSize = "compact" | "standard" | "tall";
type GradientDirection = "diagonal" | "horizontal" | "vertical";

// Helper function to adjust hex colors for gradients
const adjustColor = (hex: string, amount: number): string => {
  const cleanHex = hex.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(cleanHex.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(cleanHex.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(cleanHex.slice(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Helper to get gradient angle based on direction
const getGradientAngle = (direction: GradientDirection): string => {
  switch (direction) {
    case "horizontal": return "90deg";
    case "vertical": return "180deg";
    case "diagonal":
    default: return "135deg";
  }
};

// Professional multi-layer text shadow for broadcast quality
const getBroadcastTextShadow = (intensity: "strong" | "medium" | "light" = "strong"): string => {
  const shadows = {
    strong: `
      0 1px 0 rgba(0,0,0,0.4),
      0 2px 4px rgba(0,0,0,0.5),
      0 4px 8px rgba(0,0,0,0.3),
      0 0 20px rgba(0,0,0,0.2)
    `,
    medium: `
      0 1px 2px rgba(0,0,0,0.4),
      0 2px 4px rgba(0,0,0,0.3),
      0 0 12px rgba(0,0,0,0.15)
    `,
    light: `
      0 1px 2px rgba(0,0,0,0.3),
      0 0 8px rgba(0,0,0,0.1)
    `
  };
  return shadows[intensity];
};

// Bar bevel styles for 3D depth
const getBarBevel = (position: "top" | "bottom" | "both" = "both"): React.CSSProperties => {
  const topShadow = "inset 0 1px 0 rgba(255,255,255,0.1)";
  const bottomShadow = "inset 0 -1px 0 rgba(0,0,0,0.3)";
  
  switch (position) {
    case "top": return { boxShadow: topShadow };
    case "bottom": return { boxShadow: bottomShadow };
    case "both":
    default: return { boxShadow: `${topShadow}, ${bottomShadow}` };
  }
};

// Preset color schemes (custom is handled dynamically)
const colorSchemes: Record<Exclude<ColorScheme, "custom">, { primary: string; secondary: string; accent: string; solid: string }> = {
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
  woodGrain: {
    primary: "linear-gradient(135deg, #2c2418 0%, #3d3225 50%, #4a3d2e 100%)",
    secondary: "#1c1812",
    accent: "#8b7355",
    solid: "#3d3225",
  },
};

const sizeHeights: Record<OutputSize, number> = {
  compact: 180,
  standard: 260,
  tall: 340,
};

// Output dimensions - single source of truth
const OUTPUT_WIDTH = 1920;
// Safe zone padding (5% from left edge for broadcast safety)
const SAFE_ZONE_LEFT = 96; // ~5% of 1920

const LowerThirdGenerator = () => {
  const previewRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
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
  
  // Custom color states
  const [customAccent, setCustomAccent] = useState("#d4a855");
  const [customPrimary, setCustomPrimary] = useState("#2d2d2d");
  const [customSecondary, setCustomSecondary] = useState("#0d0d0d");
  
  // Broadcast quality options
  const [gradientDirection, setGradientDirection] = useState<GradientDirection>("horizontal");
  const [enableTextStroke, setEnableTextStroke] = useState(false);
  const [enableBarBevels, setEnableBarBevels] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string>("");

  // Build gradient with selected direction
  const buildGradient = (baseColor: string, direction: GradientDirection): string => {
    const angle = getGradientAngle(direction);
    return `linear-gradient(${angle}, ${adjustColor(baseColor, -20)} 0%, ${baseColor} 50%, ${adjustColor(baseColor, 20)} 100%)`;
  };

  // Compute colors - handle custom scheme dynamically
  const colors = colorScheme === "custom"
    ? {
        primary: buildGradient(customPrimary, gradientDirection),
        secondary: customSecondary,
        accent: customAccent,
        solid: customPrimary,
      }
    : {
        ...colorSchemes[colorScheme],
        primary: colorSchemes[colorScheme].primary.replace("135deg", getGradientAngle(gradientDirection)),
      };
  const outputHeight = sizeHeights[outputSize];
  
  // Text stroke style for high contrast
  const textStrokeStyle: React.CSSProperties = enableTextStroke 
    ? { WebkitTextStroke: "1px rgba(0,0,0,0.5)" } 
    : {};

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoUrl("");
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

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
    setCustomAccent("#d4a855");
    setCustomPrimary("#2d2d2d");
    setCustomSecondary("#0d0d0d");
    setGradientDirection("horizontal");
    setEnableTextStroke(false);
    setEnableBarBevels(true);
    setLogoUrl("");
    toast.success("Reset to defaults");
  };

  // Logo component for reuse across layouts
  const LogoDisplay = ({ size = 48 }: { size?: number }) => {
    if (!logoUrl) return null;
    return (
      <div 
        className="shrink-0 flex items-center justify-center mr-4"
        style={{ 
          width: size, 
          height: size,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
        }}
      >
        <img 
          src={logoUrl} 
          alt="Logo" 
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  };

  const renderStandardLayout = () => (
    <div className="absolute inset-0 flex flex-col justify-end" style={{ overflow: 'visible' }}>
      {/* Headline Bar */}
      <div
        className="flex items-center relative"
        style={{
          background: colors.primary,
          padding: "20px 28px",
          paddingLeft: `${SAFE_ZONE_LEFT}px`,
          borderLeft: `6px solid ${colors.accent}`,
          ...(enableBarBevels ? getBarBevel("both") : {}),
        }}
      >
        <LogoDisplay size={52} />
        <div className="flex-1 min-w-0">
          <h1
            className="font-extrabold text-white leading-tight tracking-tight truncate"
            style={{
              fontSize: "clamp(18px, 4vw, 36px)",
              textShadow: getBroadcastTextShadow("strong"),
              fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
              letterSpacing: "0.02em",
              ...textStrokeStyle,
            }}
          >
            {headline1 || "HEADLINE TEXT"}
          </h1>
          {headline2 && (
            <p
              className="text-white/90 font-medium truncate"
              style={{
                fontSize: "clamp(12px, 2vw, 20px)",
                textShadow: getBroadcastTextShadow("medium"),
                fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
                letterSpacing: "0.03em",
                ...textStrokeStyle,
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
          paddingLeft: `${SAFE_ZONE_LEFT}px`,
          ...(enableBarBevels ? getBarBevel("bottom") : {}),
        }}
      >
        <div
          className="font-bold text-white tracking-wide"
          style={{
            fontSize: "clamp(10px, 1.8vw, 16px)",
            fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
            textShadow: getBroadcastTextShadow("light"),
            letterSpacing: "0.05em",
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
            textShadow: getBroadcastTextShadow("light"),
            letterSpacing: "0.08em",
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
      <div className="flex" style={{ paddingLeft: `${SAFE_ZONE_LEFT}px` }}>
        <div
          style={{
            background: colors.accent,
            padding: "6px 16px",
            fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
            ...(enableBarBevels ? getBarBevel("top") : {}),
          }}
        >
          <span
            className="font-bold text-white tracking-wide"
            style={{
              fontSize: "clamp(10px, 1.5vw, 14px)",
              textShadow: getBroadcastTextShadow("medium"),
              letterSpacing: "0.1em",
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
          paddingLeft: `${SAFE_ZONE_LEFT}px`,
          ...(enableBarBevels ? getBarBevel("both") : {}),
        }}
      >
        <LogoDisplay size={52} />
        <div className="flex-1 min-w-0">
          <h1
            className="font-extrabold text-white leading-tight tracking-tight truncate"
            style={{
              fontSize: "clamp(18px, 4vw, 36px)",
              textShadow: getBroadcastTextShadow("strong"),
              fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
              letterSpacing: "0.02em",
              ...textStrokeStyle,
            }}
          >
            {headline1 || "HEADLINE TEXT"}
          </h1>
          {headline2 && (
            <p
              className="text-white/90 font-medium truncate"
              style={{
                fontSize: "clamp(12px, 2vw, 20px)",
                textShadow: getBroadcastTextShadow("medium"),
                fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
                letterSpacing: "0.03em",
                ...textStrokeStyle,
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
          paddingLeft: `${SAFE_ZONE_LEFT}px`,
          ...(enableBarBevels ? getBarBevel("bottom") : {}),
        }}
      >
        <div
          className="font-bold text-white tracking-wide"
          style={{
            fontSize: "clamp(10px, 1.8vw, 16px)",
            fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
            textShadow: getBroadcastTextShadow("light"),
            letterSpacing: "0.05em",
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
            textShadow: getBroadcastTextShadow("light"),
            letterSpacing: "0.08em",
          }}
        >
          {websiteUrl}
        </div>
      </div>
    </div>
  );

  const renderBreakingNewsLayout = () => (
    <div className="absolute inset-0 flex flex-col justify-end" style={{ overflow: 'visible' }}>
      <div className="flex" style={{ paddingLeft: `${SAFE_ZONE_LEFT - 96}px` }}>
        {/* Label Box on Left */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            background: colors.accent,
            padding: "20px 24px",
            minWidth: "180px",
            marginLeft: `${SAFE_ZONE_LEFT}px`,
            ...(enableBarBevels ? getBarBevel("both") : {}),
          }}
        >
          {logoUrl && (
            <div className="mr-3">
              <LogoDisplay size={40} />
            </div>
          )}
          <span
            className="font-black text-white tracking-wider text-center leading-tight"
            style={{
              fontSize: "clamp(14px, 2.5vw, 22px)",
              textShadow: getBroadcastTextShadow("strong"),
              fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
              letterSpacing: "0.1em",
              ...textStrokeStyle,
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
              ...(enableBarBevels ? getBarBevel("both") : {}),
            }}
          >
            <div className="flex-1 min-w-0">
              <h1
                className="font-extrabold text-white leading-tight tracking-tight truncate"
                style={{
                  fontSize: "clamp(16px, 3.5vw, 32px)",
                  textShadow: getBroadcastTextShadow("strong"),
                  fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
                  letterSpacing: "0.02em",
                  ...textStrokeStyle,
                }}
              >
                {headline1 || "HEADLINE TEXT"}
              </h1>
              {headline2 && (
                <p
                  className="text-white/90 font-medium truncate mt-1"
                  style={{
                    fontSize: "clamp(11px, 1.8vw, 18px)",
                    textShadow: getBroadcastTextShadow("medium"),
                    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
                    letterSpacing: "0.03em",
                    ...textStrokeStyle,
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
              ...(enableBarBevels ? getBarBevel("bottom") : {}),
            }}
          >
            <div
              className="font-bold text-white tracking-wide"
              style={{
                fontSize: "clamp(10px, 1.8vw, 16px)",
                fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
                textShadow: getBroadcastTextShadow("light"),
                letterSpacing: "0.05em",
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
                textShadow: getBroadcastTextShadow("light"),
                letterSpacing: "0.08em",
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
          marginLeft: `${SAFE_ZONE_LEFT - 20}px`,
          ...(enableBarBevels ? getBarBevel("both") : {}),
        }}
      >
        <LogoDisplay size={36} />
        {/* Main Content */}
        <div className="flex-1 py-3 px-5">
          <h1
            className="font-bold text-white leading-tight tracking-tight truncate"
            style={{
              fontSize: "clamp(14px, 3vw, 28px)",
              textShadow: getBroadcastTextShadow("medium"),
              fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
              letterSpacing: "0.02em",
              ...textStrokeStyle,
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
                  textShadow: getBroadcastTextShadow("light"),
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
                textShadow: getBroadcastTextShadow("light"),
                letterSpacing: "0.05em",
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
                    textShadow: getBroadcastTextShadow("light"),
                    letterSpacing: "0.05em",
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
                    <SelectItem value="woodGrain">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ background: "linear-gradient(135deg, #2c2418, #8b7355)" }} />
                        <span>Wood Grain (Studio Match)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="custom">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border border-dashed border-muted-foreground" style={{ background: customAccent }} />
                        <span>Custom Colors</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Custom Color Inputs */}
                {colorScheme === "custom" && (
                  <div className="space-y-3 mt-3 p-3 border rounded-lg bg-muted/50">
                    <div className="space-y-1">
                      <Label className="text-xs">Accent Color (stripe/highlights)</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={customAccent} 
                          onChange={(e) => setCustomAccent(e.target.value)}
                          className="w-12 h-9 p-1 cursor-pointer"
                        />
                        <Input 
                          value={customAccent} 
                          onChange={(e) => setCustomAccent(e.target.value)}
                          placeholder="#d4a855"
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Primary Bar Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={customPrimary} 
                          onChange={(e) => setCustomPrimary(e.target.value)}
                          className="w-12 h-9 p-1 cursor-pointer"
                        />
                        <Input 
                          value={customPrimary} 
                          onChange={(e) => setCustomPrimary(e.target.value)}
                          placeholder="#2d2d2d"
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Secondary Bar Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          type="color" 
                          value={customSecondary} 
                          onChange={(e) => setCustomSecondary(e.target.value)}
                          className="w-12 h-9 p-1 cursor-pointer"
                        />
                        <Input 
                          value={customSecondary} 
                          onChange={(e) => setCustomSecondary(e.target.value)}
                          placeholder="#0d0d0d"
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Broadcast Quality Options */}
              <div className="space-y-3 pt-3 border-t">
                <Label className="text-sm font-semibold">Broadcast Options</Label>
                
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label className="text-xs">Logo (optional)</Label>
                  <div className="flex gap-2">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {logoUrl ? "Change Logo" : "Upload Logo"}
                    </Button>
                    {logoUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeLogo}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {logoUrl && (
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <img src={logoUrl} alt="Logo preview" className="h-8 w-8 object-contain" />
                      <span className="text-xs text-muted-foreground">Logo uploaded</span>
                    </div>
                  )}
                </div>

                {/* Gradient Direction */}
                <div className="space-y-2">
                  <Label className="text-xs">Gradient Direction</Label>
                  <Select value={gradientDirection} onValueChange={(v) => setGradientDirection(v as GradientDirection)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horizontal">Horizontal (→)</SelectItem>
                      <SelectItem value="vertical">Vertical (↓)</SelectItem>
                      <SelectItem value="diagonal">Diagonal (↘)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Toggle Options */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Bar Bevels (3D depth)</Label>
                    <Switch
                      checked={enableBarBevels}
                      onCheckedChange={setEnableBarBevels}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Text Stroke (high contrast)</Label>
                    <Switch
                      checked={enableTextStroke}
                      onCheckedChange={setEnableTextStroke}
                    />
                  </div>
                </div>
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
