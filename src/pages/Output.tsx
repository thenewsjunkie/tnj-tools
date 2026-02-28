import { useOutputConfig, StudioModule, VideoFeed, getYouTubeEmbedUrl } from "@/hooks/useOutputConfig";
import SecretShowsLeaderboard from "@/pages/SecretShowsLeaderboard";
import HallOfFramePage from "@/pages/HallOfFrame";
import RestreamChatEmbed from "@/components/studio/RestreamChatEmbed";

const MODULE_COMPONENTS: Record<StudioModule, React.ComponentType> = {
  "leaderboard": SecretShowsLeaderboard,
  "hall-of-frame": HallOfFramePage,
  "live-chat": RestreamChatEmbed,
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

const OutputColumn = ({ modules, videos }: { modules: StudioModule[]; videos: VideoFeed[] }) => (
  <div className="flex-1 flex flex-col overflow-auto">
    {videos.map((v, i) => (
      <div key={`video-${i}`} className="flex-1 min-h-[300px]">
        <YouTubeEmbed url={v.url} />
      </div>
    ))}
    {modules.map((id) => {
      const Component = MODULE_COMPONENTS[id];
      return Component ? <Component key={id} /> : null;
    })}
  </div>
);

const Output = () => {
  const { data: config, isLoading } = useOutputConfig();

  if (isLoading) {
    return <div className="h-screen bg-black flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  const left = config?.leftColumn ?? [];
  const right = config?.rightColumn ?? [];
  const videoFeeds = config?.videoFeeds ?? [];

  const fullVideos = videoFeeds.filter((v) => v.placement === "full");
  const leftVideos = videoFeeds.filter((v) => v.placement === "left");
  const rightVideos = videoFeeds.filter((v) => v.placement === "right");

  const hasLeft = left.length > 0 || leftVideos.length > 0;
  const hasRight = right.length > 0 || rightVideos.length > 0;
  const hasContent = hasLeft || hasRight || fullVideos.length > 0;

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Full-width videos */}
      {fullVideos.map((v, i) => (
        <div key={`full-${i}`} className="flex-1 min-h-[300px]">
          <YouTubeEmbed url={v.url} />
        </div>
      ))}

      {/* Columns */}
      {(hasLeft || hasRight) && (
        <div className="flex-1 flex min-h-0">
          {hasLeft && <OutputColumn modules={left} videos={leftVideos} />}
          {hasLeft && hasRight && <div className="w-px bg-white/10" />}
          {hasRight && <OutputColumn modules={right} videos={rightVideos} />}
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
