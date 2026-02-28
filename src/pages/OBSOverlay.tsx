import { useState, useEffect } from "react";
import { useOBSOverlayConfig } from "@/hooks/useOBSOverlayConfig";
import { useOutputConfig, StudioModule } from "@/hooks/useOutputConfig";
import SecretShowsLeaderboard from "@/pages/SecretShowsLeaderboard";
import HallOfFramePage from "@/pages/HallOfFrame";
import RestreamChatEmbed from "@/components/studio/RestreamChatEmbed";
import AdsDisplay from "@/components/studio/AdsDisplay";

const OBSLeaderboard = () => <SecretShowsLeaderboard limit={10} showGiftCTA />;

const MODULE_COMPONENTS: Record<StudioModule, React.ComponentType<any>> = {
  leaderboard: OBSLeaderboard,
  "hall-of-frame": HallOfFramePage,
  "live-chat": RestreamChatEmbed,
  ads: AdsDisplay,
};

const OBSOverlay = () => {
  const { data: config, isLoading } = useOBSOverlayConfig();
  const { data: outputConfig } = useOutputConfig();
  const [currentIndex, setCurrentIndex] = useState(0);
  const chatZoom = outputConfig?.chatZoom;

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

  // Auto-cycle
  useEffect(() => {
    if (mode === "manual" || enabledModules.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % enabledModules.length);
    }, interval);

    return () => clearInterval(timer);
  }, [mode, enabledModules.length, interval]);

  // When pinned, jump to that module
  useEffect(() => {
    if (mode === "manual" && pinnedModule) {
      const idx = enabledModules.indexOf(pinnedModule);
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [mode, pinnedModule, enabledModules]);

  if (isLoading) return null;
  if (enabledModules.length === 0) return null;

  return (
    <div className="h-screen w-screen overflow-hidden relative" style={{ background: "transparent" }}>
      {enabledModules.map((moduleId, index) => {
        const Component = MODULE_COMPONENTS[moduleId];
        if (!Component) return null;
        const isActive = index === currentIndex;
        return (
          <div
            key={moduleId}
            className={`absolute inset-0 transition-opacity duration-500 ${
              isActive ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <Component zoom={moduleId === "live-chat" ? chatZoom : undefined} />
          </div>
        );
      })}
    </div>
  );
};

export default OBSOverlay;
