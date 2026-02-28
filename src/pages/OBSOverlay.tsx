import { useState, useEffect, useCallback } from "react";
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
  const [transitioning, setTransitioning] = useState(false);

  const enabledModules = config?.enabledModules ?? [];
  const mode = config?.mode ?? "auto";
  const pinnedModule = config?.pinnedModule;
  const interval = (config?.cycleIntervalSeconds ?? 30) * 1000;

  // Reset index when modules change
  useEffect(() => {
    if (currentIndex >= enabledModules.length && enabledModules.length > 0) {
      setCurrentIndex(0);
    }
  }, [enabledModules.length, currentIndex]);

  // Auto-cycle
  useEffect(() => {
    if (mode === "manual" || enabledModules.length <= 1) return;

    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % enabledModules.length);
        setTransitioning(false);
      }, 600);
    }, interval);

    return () => clearInterval(timer);
  }, [mode, enabledModules.length, interval]);

  // When pinned, jump to that module
  useEffect(() => {
    if (mode === "manual" && pinnedModule) {
      const idx = enabledModules.indexOf(pinnedModule);
      if (idx !== -1 && idx !== currentIndex) {
        setTransitioning(true);
        setTimeout(() => {
          setCurrentIndex(idx);
          setTransitioning(false);
        }, 600);
      }
    }
  }, [mode, pinnedModule, enabledModules]);

  if (isLoading) return null;

  if (enabledModules.length === 0) {
    return null; // Transparent, nothing to show
  }

  const activeModule = enabledModules[currentIndex];
  const Component = activeModule ? MODULE_COMPONENTS[activeModule] : null;

  return (
    <div className="h-screen w-screen overflow-hidden" style={{ background: "transparent" }}>
      <style>{`
        body, html { background: transparent !important; }
        .obs-overlay-enter {
          animation: obsOverlayIn 0.6s ease-out forwards;
        }
        @keyframes obsOverlayIn {
          0% { opacity: 0; transform: translateY(20px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div
        className={`h-full w-full transition-opacity duration-500 ${
          transitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        {Component && (
          <div key={activeModule} className="h-full w-full obs-overlay-enter">
            <Component />
          </div>
        )}
      </div>
    </div>
  );
};

export default OBSOverlay;
