import { Twitch } from "lucide-react";
import BotStatusIndicator from "@/components/chat/BotStatusIndicator";
import YouTubeSettings from "@/components/chat/YouTubeSettings";

interface BotStatusProps {
  twitchStatus: "connected" | "disconnected";
  youtubeStatus: "connected" | "disconnected";
  setTwitchStatus: (status: "connected" | "disconnected") => void;
  setYoutubeStatus: (status: "connected" | "disconnected") => void;
  onStartYouTube: (videoId: string) => void;
}

export const BotStatus = ({ 
  twitchStatus, 
  youtubeStatus, 
  setTwitchStatus, 
  setYoutubeStatus,
  onStartYouTube 
}: BotStatusProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Bot Status</h2>
      <div className="flex flex-col gap-4">
        <BotStatusIndicator
          botType="twitch"
          icon={<Twitch className="h-5 w-5 text-purple-500" />}
          status={twitchStatus}
          setStatus={setTwitchStatus}
        />
        <YouTubeSettings 
          status={youtubeStatus}
          onStart={onStartYouTube}
        />
      </div>
    </div>
  );
};