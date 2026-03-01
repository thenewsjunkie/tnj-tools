import { useState, useEffect, useCallback } from "react";
import { useArtModeConfig, ArtModeImage } from "@/hooks/useArtMode";

const FRAME_STYLES: Record<string, React.CSSProperties> = {
  gold: {
    border: "12px solid",
    borderImage: "linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c) 1",
    boxShadow: "inset 0 0 20px rgba(0,0,0,0.4), 0 0 30px rgba(191,149,63,0.3)",
  },
  dark: {
    border: "10px solid #1a1a1a",
    boxShadow: "inset 0 0 15px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.5)",
  },
  minimal: {
    border: "2px solid rgba(255,255,255,0.15)",
  },
  none: {},
};

const ArtModeDisplay = () => {
  const { data: config } = useArtModeConfig();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const images = config?.images ?? [];
  const interval = (config?.intervalSeconds ?? 30) * 1000;
  const permanent = config?.permanent ?? false;
  const transition = config?.transition ?? "fade";
  const frameStyle = config?.frameStyle ?? "gold";

  const advance = useCallback(() => {
    if (images.length <= 1 || permanent) return;
    if (transition === "none") {
      setCurrentIndex((p) => (p + 1) % images.length);
      return;
    }
    setVisible(false);
    setTimeout(() => {
      setCurrentIndex((p) => (p + 1) % images.length);
      setVisible(true);
    }, 400);
  }, [images.length, permanent, transition]);

  useEffect(() => {
    if (images.length <= 1 || permanent) return;
    const timer = setInterval(advance, interval);
    return () => clearInterval(timer);
  }, [advance, interval, images.length, permanent]);

  useEffect(() => {
    setCurrentIndex((p) => (images.length > 0 ? p % images.length : 0));
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No art images configured</p>
      </div>
    );
  }

  const current = images[currentIndex];
  const frame = FRAME_STYLES[frameStyle] ?? {};

  const transitionClass =
    transition === "fade"
      ? "transition-opacity duration-500"
      : transition === "slide"
      ? "transition-transform duration-500"
      : transition === "zoom"
      ? "transition-all duration-500"
      : "";

  const transitionStyle: React.CSSProperties =
    transition === "fade"
      ? { opacity: visible ? 1 : 0 }
      : transition === "slide"
      ? { transform: visible ? "translateX(0)" : "translateX(100%)" }
      : transition === "zoom"
      ? { opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.85)" }
      : {};

  return (
    <div className="w-full h-full bg-black flex items-center justify-center p-6">
      <div
        className={`relative max-w-full max-h-full ${transitionClass}`}
        style={{ ...frame, ...transitionStyle }}
      >
        <img
          key={current.id}
          src={current.imageUrl}
          alt={current.label}
          className="max-w-full max-h-[calc(100vh-100px)] object-contain block"
        />
        {current.label && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-8">
            <p className="text-white/80 text-sm text-center font-medium">{current.label}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtModeDisplay;
