import { useEffect, useRef, useCallback } from "react";
import { useTelePrompter, useUpdateTelePrompter } from "@/hooks/useTelePrompter";

const TelePrompter = () => {
  const { data: config } = useTelePrompter();
  const { mutate: save } = useUpdateTelePrompter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const isPlaying = config?.isPlaying ?? false;
  const speed = config?.speed ?? 3;
  const fontSize = config?.fontSize ?? 36;
  const mirror = config?.mirror ?? false;
  const script = config?.script ?? "";
  const scrollPosition = config?.scrollPosition ?? 0;

  // Reset scroll when scrollPosition changes (timestamp-based)
  const lastResetRef = useRef(scrollPosition);
  useEffect(() => {
    if (scrollPosition !== lastResetRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      lastResetRef.current = scrollPosition;
    }
  }, [scrollPosition]);

  // Smooth scroll animation
  const animate = useCallback(
    (time: number) => {
      if (!scrollRef.current) return;
      if (lastTimeRef.current) {
        const delta = time - lastTimeRef.current;
        const pxPerMs = (speed * 20) / 1000;
        scrollRef.current.scrollTop += pxPerMs * delta;
      }
      lastTimeRef.current = time;
      animRef.current = requestAnimationFrame(animate);
    },
    [speed]
  );

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = 0;
      animRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animRef.current);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, animate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!config) return;
      if (e.code === "Space") {
        e.preventDefault();
        save({ ...config, isPlaying: !config.isPlaying });
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        save({ ...config, speed: Math.min(10, config.speed + 1) });
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        save({ ...config, speed: Math.max(1, config.speed - 1) });
      } else if (e.code === "KeyR") {
        e.preventDefault();
        save({ ...config, isPlaying: false, scrollPosition: Date.now() });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [config, save]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Highlight color styles for mark elements */}
      <style>{`
        .teleprompter-content mark {
          background-color: #fde047;
          color: black;
          padding: 0 2px;
          border-radius: 2px;
        }
        .teleprompter-content mark[data-color="#fde047"] { background-color: #fde047; }
        .teleprompter-content mark[data-color="#86efac"] { background-color: #86efac; }
        .teleprompter-content mark[data-color="#67e8f9"] { background-color: #67e8f9; }
        .teleprompter-content mark[data-color="#f9a8d4"] { background-color: #f9a8d4; }
        .teleprompter-content mark[data-color="#fdba74"] { background-color: #fdba74; }
        .teleprompter-content mark[style*="background-color"] { color: black; }
        .teleprompter-content p { margin: 0.25em 0; }
        .teleprompter-content ul, .teleprompter-content ol { margin-left: 1.5em; }
      `}</style>

      {/* Guide line */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-px h-[2px] bg-red-500/60 z-10 pointer-events-none" />

      <div
        ref={scrollRef}
        className="h-full overflow-y-auto scrollbar-hide"
        style={{
          transform: mirror ? "scaleX(-1)" : undefined,
        }}
      >
        {/* Top padding so text starts at bottom */}
        <div className="h-[50vh]" />
        <div
          className="teleprompter-content max-w-[80ch] mx-auto px-8 pb-[50vh] text-white font-sans leading-relaxed"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.5 }}
          dangerouslySetInnerHTML={{
            __html: script || "No script loaded. Paste a script in the Studio Screen TelePrompter control.",
          }}
        />
      </div>
    </div>
  );
};

export default TelePrompter;
