import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  { key: "g", label: "Green", color: "#00FF00" },
  { key: "b", label: "Blue", color: "#0000FF" },
  { key: "m", label: "Magenta", color: "#FF00FF" },
  { key: "w", label: "White", color: "#FFFFFF" },
  { key: "k", label: "Black", color: "#000000" },
];

const GreenScreen = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialColor = searchParams.get("color") 
    ? `#${searchParams.get("color")}` 
    : "#00FF00";
  
  const [color, setColor] = useState(initialColor);
  const [showControls, setShowControls] = useState(true);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimeout) clearTimeout(hideTimeout);
    const timeout = setTimeout(() => setShowControls(false), 3000);
    setHideTimeout(timeout);
  }, [hideTimeout]);

  const handleExit = () => {
    navigate("/admin");
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      handleExit();
      return;
    }
    
    const preset = PRESET_COLORS.find(p => p.key === e.key.toLowerCase());
    if (preset) {
      setColor(preset.color);
      resetHideTimer();
    }
  }, [resetHideTimer]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    resetHideTimer();
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [handleKeyDown]);

  const handleMouseMove = () => {
    resetHideTimer();
  };

  const handleClick = () => {
    setShowControls(!showControls);
    if (!showControls) resetHideTimer();
  };

  const isDark = color === "#000000" || color === "#0000FF";

  return (
    <div
      className="fixed inset-0 z-50 cursor-none"
      style={{ backgroundColor: color }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Controls overlay */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 p-6 transition-all duration-300 cursor-auto",
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={cn(
          "max-w-2xl mx-auto rounded-lg p-4 backdrop-blur-md",
          isDark ? "bg-white/20" : "bg-black/20"
        )}>
          {/* Color presets */}
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.key}
                onClick={() => setColor(preset.color)}
                className={cn(
                  "w-12 h-12 rounded-lg border-2 transition-transform hover:scale-110",
                  color === preset.color ? "ring-2 ring-offset-2 ring-white scale-110" : "",
                  preset.color === "#FFFFFF" ? "border-gray-300" : "border-transparent"
                )}
                style={{ backgroundColor: preset.color }}
                title={`${preset.label} (${preset.key.toUpperCase()})`}
              />
            ))}
            
            {/* Custom color picker */}
            <label className="relative">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 w-12 h-12 opacity-0 cursor-pointer"
              />
              <div
                className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center"
                style={{ 
                  background: `conic-gradient(red, yellow, lime, aqua, blue, magenta, red)` 
                }}
                title="Custom color"
              >
                <span className="text-xs font-bold text-white drop-shadow-lg">+</span>
              </div>
            </label>
          </div>

          {/* Exit button and instructions */}
          <div className="flex items-center justify-between">
            <p className={cn(
              "text-xs",
              isDark ? "text-white/70" : "text-black/70"
            )}>
              Press <kbd className="px-1 py-0.5 rounded bg-white/20">Esc</kbd> to exit • 
              <kbd className="px-1 py-0.5 rounded bg-white/20 ml-1">G</kbd>
              <kbd className="px-1 py-0.5 rounded bg-white/20 ml-1">B</kbd>
              <kbd className="px-1 py-0.5 rounded bg-white/20 ml-1">M</kbd>
              <kbd className="px-1 py-0.5 rounded bg-white/20 ml-1">W</kbd>
              <kbd className="px-1 py-0.5 rounded bg-white/20 ml-1">K</kbd> for colors
            </p>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExit}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Exit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreenScreen;
