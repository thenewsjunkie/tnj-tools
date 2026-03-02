import { useState, useEffect, useRef } from "react";
import { useOutputConfig, StudioModule, VideoFeed, getYouTubeEmbedUrl } from "@/hooks/useOutputConfig";
import SecretShowsLeaderboard from "@/pages/SecretShowsLeaderboard";
import HallOfFramePage from "@/pages/HallOfFrame";
import RestreamChatEmbed from "@/components/studio/RestreamChatEmbed";
import DiscordChatEmbed from "@/components/studio/DiscordChatEmbed";
import AdsDisplay from "@/components/studio/AdsDisplay";
import ArtModeDisplay from "@/components/studio/ArtModeDisplay";
import TelePrompterPage from "@/pages/TelePrompter";
import ClockOverlay from "@/components/studio/overlays/ClockOverlay";

const OutputLeaderboard = () => <SecretShowsLeaderboard limit={10} />;
const OutputHallOfFrame = () => <HallOfFramePage fillContainer />;

const MODULE_COMPONENTS: Record<StudioModule, React.ComponentType> = {
  "leaderboard": OutputLeaderboard,
  "hall-of-frame": OutputHallOfFrame,
  "live-chat": RestreamChatEmbed,
  "ads": AdsDisplay,
  "teleprompter": TelePrompterPage,
  "art-mode": ArtModeDisplay,
};

const YouTubeEmbed = ({ url }: { url: string }) => {
  const embedUrl = getYouTubeEmbedUrl(url);
  if (!embedUrl) return null;

  return (
    <div className="w-full h-full">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ border: 0 }}
      />
    </div>
  );
};

const RotatingModules = ({ modules, intervalMs }: { modules: StudioModule[]; intervalMs: number }) => {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const countRef = useRef(modules.length);
  countRef.current = modules.length;

  useEffect(() => {
    if (modules.length <= 1) return;
    const timer = setInterval(() => {
      setOpacity(0);
      setTimeout(() => {
        setVisibleIndex((prev) => (prev + 1) % countRef.current);
        setOpacity(1);
      }, 400);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, modules.length]);

  // Keep index in bounds
  useEffect(() => {
    setVisibleIndex((prev) => (modules.length > 0 ? prev % modules.length : 0));
  }, [modules.length]);

  return (
    <div className="flex-1 relative overflow-hidden">
      {modules.map((id, i) => {
        const Component = MODULE_COMPONENTS[id];
        if (!Component) return null;
        return (
          <div
            key={id}
            className="absolute inset-0 transition-opacity duration-400"
            style={{
              opacity: i === visibleIndex ? opacity : 0,
              pointerEvents: i === visibleIndex ? "auto" : "none",
            }}
          >
            <Component />
          </div>
        );
      })}
    </div>
  );
};

const OutputColumn = ({
  modules,
  videos,
  chatVisible,
  rotate,
  rotateInterval,
  chatZoom,
  chatSource,
}: {
  modules: StudioModule[];
  videos: VideoFeed[];
  chatVisible?: boolean;
  rotate?: boolean;
  rotateInterval?: number;
  chatZoom?: number;
  chatSource?: "restream" | "discord";
}) => {
  const nonChatModules = modules.filter((id) => id !== "live-chat");
  const intervalMs = (rotateInterval ?? 30) * 1000;
  const useDiscord = chatSource === "discord";

  const ChatComponent = useDiscord ? DiscordChatEmbed : RestreamChatEmbed;

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      {videos.map((v, i) => (
        <div key={`video-${i}`} className="flex-1 min-h-[300px]">
          <YouTubeEmbed url={v.url} />
        </div>
      ))}
      {rotate && nonChatModules.length > 1 ? (
        <RotatingModules modules={nonChatModules} intervalMs={intervalMs} />
      ) : (
        nonChatModules.map((id) => {
          const Component = MODULE_COMPONENTS[id];
          return Component ? <Component key={id} /> : null;
        })
      )}
      {/* Active chat source */}
      <div className={chatVisible ? "flex-1 min-h-[400px]" : "hidden"}>
        <ChatComponent zoom={chatZoom} />
      </div>
      {/* Keep Restream always mounted (hidden) when using Discord to preserve history */}
      {useDiscord && (
        <div className="hidden">
          <RestreamChatEmbed zoom={chatZoom} />
        </div>
      )}
    </div>
  );
};

const Output = () => {
  const { data: config, isLoading } = useOutputConfig();

  useEffect(() => {
    document.body.style.cursor = 'none';
    return () => { document.body.style.cursor = 'auto'; };
  }, []);


  if (isLoading) {
    return <div className="h-screen bg-black flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  const fullScreenModule = config?.fullScreen ?? null;
  const left = config?.leftColumn ?? [];
  const right = config?.rightColumn ?? [];
  const videoFeeds = config?.videoFeeds ?? [];
  const rotation = config?.rotation ?? 0;
  const chatZoom = config?.chatZoom;
  const chatSource = config?.chatSource ?? "restream";
  const overlays = config?.overlays;
  const useDiscord = chatSource === "discord";
  const ActiveChat = useDiscord ? DiscordChatEmbed : RestreamChatEmbed;

  const isRotated90or270 = rotation === 90 || rotation === 270;
  const rotationStyle: React.CSSProperties = rotation !== 0 ? {
    transform: `rotate(${rotation}deg)`,
    transformOrigin: "center center",
    ...(isRotated90or270 ? { width: "100vh", height: "100vw" } : {}),
    position: "fixed",
    top: "50%",
    left: "50%",
    translate: "-50% -50%",
  } : {};

  const centerVideos = videoFeeds.filter((v) => v.placement === "center" || v.placement === ("full" as any));
  const pipLeftVideos = videoFeeds.filter((v) => v.placement === "pip-left");
  const pipRightVideos = videoFeeds.filter((v) => v.placement === "pip-right" || v.placement === ("pip" as any));

  const chatInLeft = left.includes("live-chat");
  const chatInRight = right.includes("live-chat");
  const chatIsFullScreen = fullScreenModule === "live-chat";

  const hasLeft = left.length > 0;
  const hasRight = right.length > 0;
  const hasContent = hasLeft || hasRight || centerVideos.length > 0 || !!fullScreenModule;

  // Chat is orphan if not in any column and not full-screen
  const chatOrphan = !chatInLeft && !chatInRight && !chatIsFullScreen;

  // Full-screen mode: render only that module
  if (fullScreenModule) {
    const FullComponent = MODULE_COMPONENTS[fullScreenModule];
    return (
      <div
        className="h-screen bg-black flex flex-col relative"
        style={rotationStyle}
      >
        {overlays?.clock?.enabled && <ClockOverlay position={overlays.clock.position} />}
        {centerVideos.length > 0 && (
          <div className="absolute inset-0 z-0">
            {centerVideos.map((v, i) => (
              <div key={`center-fs-${i}`} className="w-full h-full">
                <YouTubeEmbed url={v.url} />
              </div>
            ))}
          </div>
        )}
        {/* Full-screen module above center video */}
        <div className="flex-1 min-h-0 relative z-10 overflow-hidden" style={{ isolation: 'isolate' }}>
          {fullScreenModule === "live-chat" ? (
            <ActiveChat zoom={chatZoom} />
          ) : (
            FullComponent && <FullComponent />
          )}
        </div>
        {/* Always keep Restream mounted when using Discord */}
        {(fullScreenModule !== "live-chat" || useDiscord) && (
          <div className="hidden">
            <RestreamChatEmbed zoom={chatZoom} />
          </div>
        )}
        {/* PiP overlays */}
        {pipLeftVideos.length > 0 && (
          <div className="fixed top-4 left-4 z-[9999] flex flex-col gap-4 pointer-events-none">
            {pipLeftVideos.map((v, i) => (
              <div key={`pip-l-${i}`} className="w-[1280px] aspect-video rounded-lg shadow-2xl overflow-hidden border border-white/10 pointer-events-auto">
                <YouTubeEmbed url={v.url} />
              </div>
            ))}
          </div>
        )}
        {pipRightVideos.length > 0 && (
          <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-4 pointer-events-none">
            {pipRightVideos.map((v, i) => (
              <div key={`pip-r-${i}`} className="w-[1280px] aspect-video rounded-lg shadow-2xl overflow-hidden border border-white/10 pointer-events-auto">
                <YouTubeEmbed url={v.url} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="h-screen bg-black flex flex-col relative"
      style={rotationStyle}
    >
      {overlays?.clock?.enabled && <ClockOverlay position={overlays.clock.position} />}
      {centerVideos.map((v, i) => (
        <div key={`center-${i}`} className="flex-1 min-h-[300px]">
          <YouTubeEmbed url={v.url} />
        </div>
      ))}

      {(hasLeft || hasRight) && (
        <div className={`flex-1 flex min-h-0 ${(config?.orientation ?? "horizontal") === "vertical" ? "flex-col" : "flex-row"}`}>
          {hasLeft && (
            <OutputColumn
              modules={left}
              videos={[]}
              chatVisible={chatInLeft}
              rotate={config?.leftRotate}
              rotateInterval={config?.rotateInterval}
              chatZoom={chatZoom}
              chatSource={chatSource}
            />
          )}
          {hasLeft && hasRight && <div className={`${(config?.orientation ?? "horizontal") === "vertical" ? "h-px" : "w-px"} bg-white/10`} />}
          {hasRight && (
            <OutputColumn
              modules={right}
              videos={[]}
              chatVisible={chatInRight}
              rotate={config?.rightRotate}
              rotateInterval={config?.rotateInterval}
              chatZoom={chatZoom}
              chatSource={chatSource}
            />
          )}
        </div>
      )}

      {/* PiP overlay videos */}
      {pipLeftVideos.length > 0 && (
        <div className="fixed top-4 left-4 z-[9999] flex flex-col gap-4 pointer-events-none">
          {pipLeftVideos.map((v, i) => (
            <div key={`pip-l-${i}`} className="w-[1280px] aspect-video rounded-lg shadow-2xl overflow-hidden border border-white/10">
              <YouTubeEmbed url={v.url} />
            </div>
          ))}
        </div>
      )}
      {pipRightVideos.length > 0 && (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-4 pointer-events-none">
          {pipRightVideos.map((v, i) => (
            <div key={`pip-r-${i}`} className="w-[1280px] aspect-video rounded-lg shadow-2xl overflow-hidden border border-white/10">
              <YouTubeEmbed url={v.url} />
            </div>
          ))}
        </div>
      )}

      {/* Always-mounted orphan chat when not assigned to any column */}
      {chatOrphan && (
        <div className="hidden">
          <RestreamChatEmbed zoom={chatZoom} />
        </div>
      )}

      {!hasContent && (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          No modules configured. Use Studio Screen to set up the output.
        </div>
      )}
    </div>
  );
};

export default Output;
