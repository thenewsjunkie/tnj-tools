import { useState, useEffect, useCallback, useRef } from "react";
import { useHallOfFramePhotos, useHallOfFrameSettings, HallOfFramePhoto } from "@/hooks/useHallOfFrame";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Pause, Play } from "lucide-react";

// Fisher-Yates shuffle, optionally avoiding a specific index at position 0
const shuffleIndices = (length: number, avoidFirst?: number): number[] => {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // If the first element matches avoidFirst, swap it with a random other position
  if (avoidFirst !== undefined && arr.length > 1 && arr[0] === avoidFirst) {
    const swapIdx = 1 + Math.floor(Math.random() * (arr.length - 1));
    [arr[0], arr[swapIdx]] = [arr[swapIdx], arr[0]];
  }
  return arr;
};

const HallOfFrame = () => {
  const { data: photos = [] } = useHallOfFramePhotos();
  const { data: settings } = useHallOfFrameSettings();
  const queryClient = useQueryClient();
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
  const [posInOrder, setPosInOrder] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const interval = (settings?.interval_seconds ?? 8) * 1000;
  const transition = settings?.transition ?? "fade";

  // Generate shuffled order when photos.length changes
  useEffect(() => {
    if (photos.length > 0) {
      setShuffledOrder(shuffleIndices(photos.length));
      setPosInOrder(0);
    } else {
      setShuffledOrder([]);
      setPosInOrder(0);
    }
  }, [photos.length]);

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

  const shuffledOrderRef = useRef(shuffledOrder);
  shuffledOrderRef.current = shuffledOrder;
  const intervalRef = useRef(interval);
  intervalRef.current = interval;

  // Auto-advance using recursive setTimeout
  useEffect(() => {
    if (paused || shuffledOrderRef.current.length <= 1) return;
    const timer = setTimeout(() => {
      setTransitioning(true);
      setTimeout(() => {
        setPosInOrder((prev) => {
          const next = prev + 1;
          if (next >= shuffledOrderRef.current.length) {
            // Reshuffle, avoiding the last shown photo as the first of the new cycle
            const lastShown = shuffledOrderRef.current[prev];
            const newOrder = shuffleIndices(shuffledOrderRef.current.length, lastShown);
            setShuffledOrder(newOrder);
            return 0;
          }
          return next;
        });
        setTransitioning(false);
      }, 800);
    }, intervalRef.current);
    return () => clearTimeout(timer);
  }, [paused, posInOrder]);

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

  const currentIndex = shuffledOrder.length > 0 ? shuffledOrder[posInOrder] : 0;
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
    <div className="relative h-full min-h-screen bg-black cursor-pointer select-none flex items-center justify-center" onClick={handleClick}>
      {/* Museum frame styles */}
      <style>{`
        .museum-frame {
          position: relative;
          padding: 12px;
          background: linear-gradient(145deg, #c9a84c, #a07828, #d4af37, #8b6914, #c9a84c);
          border-radius: 4px;
          box-shadow:
            0 0 0 1px #5a3e0a,
            0 0 0 3px #8b6914,
            0 0 0 4px #3d2a06,
            inset 0 0 0 1px #5a3e0a,
            inset 2px 2px 8px rgba(0,0,0,0.4),
            4px 4px 20px rgba(0,0,0,0.6),
            8px 8px 40px rgba(0,0,0,0.4);
        }
        @media (min-width: 640px) {
          .museum-frame { padding: 20px; }
        }
        .museum-frame::before {
          content: '';
          position: absolute;
          inset: 4px;
          border: 1px solid rgba(255,215,0,0.3);
          border-radius: 2px;
          pointer-events: none;
        }
        .museum-frame::after {
          content: '';
          position: absolute;
          inset: 8px;
          border: 1px solid rgba(139,105,20,0.5);
          border-radius: 1px;
          pointer-events: none;
        }
        .museum-inner {
          position: relative;
          background: #0a0a0a;
          box-shadow: inset 0 0 30px rgba(0,0,0,0.8), inset 0 0 4px rgba(0,0,0,1);
          overflow: hidden;
        }
        .nameplate {
          background: linear-gradient(180deg, #d4af37, #b8962e, #d4af37);
          color: #1a0f00;
          font-family: 'Georgia', 'Times New Roman', serif;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 4px 16px;
          font-size: 9px;
          border-radius: 2px;
          box-shadow:
            0 2px 8px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.3),
            inset 0 -1px 0 rgba(0,0,0,0.2);
          border: 1px solid #8b6914;
          text-shadow: 0 1px 0 rgba(255,255,255,0.2);
        }
        @media (min-width: 640px) {
          .nameplate {
            padding: 6px 28px;
            font-size: 11px;
          }
        }
      `}</style>

      <div className="flex flex-col items-center gap-3 sm:gap-4 p-3 sm:p-6 max-h-screen">
        {/* The frame */}
        <div className="museum-frame max-w-full" style={getTransitionStyle()}>
          <div className="museum-inner flex items-center justify-center">
            <img
              src={photo.image_url}
              alt={photo.caption || ""}
              className="max-w-full max-h-[60vh] sm:max-h-[70vh] object-contain block"
            />
          </div>
        </div>

        {/* Nameplate */}
        <div className="nameplate">Hall of Frame</div>

        {/* Caption */}
        {photo.caption && (
          <p className="text-white/70 text-xs sm:text-sm text-center italic max-w-md">
            {photo.caption}
          </p>
        )}
      </div>

      {/* Pause/Play indicator */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-black/60 rounded-full p-4">
          {paused ? <Play className="h-8 w-8 sm:h-12 sm:w-12 text-white" /> : <Pause className="h-8 w-8 sm:h-12 sm:w-12 text-white" />}
        </div>
      </div>
    </div>
  );
};

export default HallOfFrame;
