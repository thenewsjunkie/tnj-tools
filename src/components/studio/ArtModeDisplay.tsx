import { useState, useEffect, useCallback } from "react";
import { useArtModeConfig } from "@/hooks/useArtMode";

const ArtModeDisplay = () => {
  const { data: config } = useArtModeConfig();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const images = config?.images ?? [];
  const interval = (config?.intervalSeconds ?? 30) * 1000;
  const permanent = config?.permanent ?? false;
  const transition = config?.transition ?? "fade";

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
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No art images configured</p>
      </div>
    );
  }

  const current = images[currentIndex];

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
    <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
      <img
        key={current.id}
        src={current.imageUrl}
        alt=""
        className={`w-full h-full object-contain block ${transitionClass}`}
        style={transitionStyle}
      />
    </div>
  );
};

export default ArtModeDisplay;
