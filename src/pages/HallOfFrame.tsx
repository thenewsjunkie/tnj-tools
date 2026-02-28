import { useState, useEffect, useCallback } from "react";
import { useHallOfFramePhotos, useHallOfFrameSettings, HallOfFramePhoto } from "@/hooks/useHallOfFrame";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Pause, Play } from "lucide-react";

const HallOfFrame = () => {
  const { data: photos = [] } = useHallOfFramePhotos();
  const { data: settings } = useHallOfFrameSettings();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const interval = (settings?.interval_seconds ?? 8) * 1000;
  const transition = settings?.transition ?? "fade";

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("hall-of-frame-realtime")
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "hall_of_frame_photos" }, () => {
        queryClient.invalidateQueries({ queryKey: ["hall-of-frame-photos"] });
      })
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "hall_of_frame_settings" }, () => {
        queryClient.invalidateQueries({ queryKey: ["hall-of-frame-settings"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  // Auto-advance
  useEffect(() => {
    if (paused || photos.length <= 1) return;
    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
        setTransitioning(false);
      }, 800);
    }, interval);
    return () => clearInterval(timer);
  }, [paused, photos.length, interval]);

  // Keep index in bounds
  useEffect(() => {
    if (currentIndex >= photos.length && photos.length > 0) {
      setCurrentIndex(0);
    }
  }, [photos.length, currentIndex]);

  const handleClick = useCallback(() => {
    setPaused((p) => !p);
    setShowControls(true);
    setTimeout(() => setShowControls(false), 2000);
  }, []);

  if (photos.length === 0) {
    return (
      <div className="h-full min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/50 text-lg">No photos to display</p>
      </div>
    );
  }

  const photo = photos[currentIndex] as HallOfFramePhoto | undefined;
  if (!photo) return null;

  const getTransitionStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = { transition: "all 0.8s ease-in-out" };
    if (transition === "fade") {
      return { ...base, opacity: transitioning ? 0 : 1 };
    }
    if (transition === "slide") {
      return { ...base, transform: transitioning ? "translateX(100%)" : "translateX(0)" };
    }
    if (transition === "zoom") {
      return { ...base, transform: transitioning ? "scale(1.2)" : "scale(1)", opacity: transitioning ? 0 : 1 };
    }
    return base;
  };

  return (
    <div className="relative h-full min-h-screen bg-black cursor-pointer select-none" onClick={handleClick}>
      <div className="w-full h-full flex items-center justify-center overflow-hidden p-1 sm:p-0" style={getTransitionStyle()}>
        <img
          src={photo.image_url}
          alt={photo.caption || ""}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {photo.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-6 pt-8 sm:pt-16">
          <p className="text-white text-sm sm:text-xl text-center">{photo.caption}</p>
        </div>
      )}

      {/* Pause/Play indicator */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-black/60 rounded-full p-4">
          {paused ? <Play className="h-12 w-12 text-white" /> : <Pause className="h-12 w-12 text-white" />}
        </div>
      </div>

      {/* Progress dots */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {photos.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex ? "bg-white scale-125" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HallOfFrame;
