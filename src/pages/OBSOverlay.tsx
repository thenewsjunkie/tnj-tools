import { useState, useEffect, useRef } from "react";
import { useOBSOverlayConfig } from "@/hooks/useOBSOverlayConfig";
import { StudioModule } from "@/hooks/useOutputConfig";
import SecretShowsLeaderboard from "@/pages/SecretShowsLeaderboard";
import HallOfFramePage from "@/pages/HallOfFrame";
import RestreamChatEmbed from "@/components/studio/RestreamChatEmbed";
import AdsDisplay from "@/components/studio/AdsDisplay";

const MODULE_COMPONENTS: Record<StudioModule, React.ComponentType> = {
  leaderboard: SecretShowsLeaderboard,
  "hall-of-frame": HallOfFramePage,
  "live-chat": RestreamChatEmbed,
  ads: AdsDisplay,
};

const OBSOverlay = () => {
  const { data: config, isLoading } = useOBSOverlayConfig();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [fading, setFading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const enabledModules = config?.enabledModules ?? [];
  const mode = config?.mode ?? "auto";
  const pinnedModule = config?.pinnedModule;
  const interval = (config?.cycleIntervalSeconds ?? 30) * 1000;

  // Add body class for transparent background
  useEffect(() => {
    document.body.classList.add("obs-overlay");
    return () => {
      document.body.classList.remove("obs-overlay");
    };
  }, []);

  // Reset index when modules change
  useEffect(() => {
    if (currentIndex >= enabledModules.length && enabledModules.length > 0) {
      setCurrentIndex(0);
    }
  }, [enabledModules.length, currentIndex]);

  const transitionTo = (nextIndex: number) => {
    if (nextIndex === currentIndex) return;
    setPrevIndex(currentIndex);
    setCurrentIndex(nextIndex);
    setFading(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setPrevIndex(null);
      setFading(false);
    }, 600);
  };

  // Auto-cycle
  useEffect(() => {
    if (mode === "manual" || enabledModules.length <= 1) return;

    const timer = setInterval(() => {
      const next = (currentIndex + 1) % enabledModules.length;
      transitionTo(next);
    }, interval);

    return () => clearInterval(timer);
  }, [mode, enabledModules.length, interval, currentIndex]);

  // When pinned, jump to that module
  useEffect(() => {
    if (mode === "manual" && pinnedModule) {
      const idx = enabledModules.indexOf(pinnedModule);
      if (idx !== -1 && idx !== currentIndex) {
        transitionTo(idx);
      }
    }
  }, [mode, pinnedModule, enabledModules]);

  if (isLoading) return null;
  if (enabledModules.length === 0) return null;

  const activeModule = enabledModules[currentIndex];
  const ActiveComponent = activeModule ? MODULE_COMPONENTS[activeModule] : null;

  const prevModule = prevIndex !== null ? enabledModules[prevIndex] : null;
  const PrevComponent = prevModule ? MODULE_COMPONENTS[prevModule] : null;

  return (
    <div className="h-screen w-screen overflow-hidden relative" style={{ background: "transparent" }}>
      {/* Outgoing module — fades out */}
      {fading && PrevComponent && (
        <div className="absolute inset-0 transition-opacity duration-500 opacity-0">
          <PrevComponent />
        </div>
      )}

      {/* Active module — fades in */}
      {ActiveComponent && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            fading ? "opacity-0" : "opacity-100"
          }`}
        >
          <ActiveComponent />
        </div>
      )}
    </div>
  );
};

export default OBSOverlay;
