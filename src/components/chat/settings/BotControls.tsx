import { useState } from "react";
import { BotStatus } from "./bot-controls/BotStatus";
import { BotActions } from "./bot-controls/BotActions";

export const BotControls = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [twitchStatus, setTwitchStatus] = useState<"connected" | "disconnected">("disconnected");
  const [youtubeStatus, setYoutubeStatus] = useState<"connected" | "disconnected">("disconnected");

  const handleStartYouTube = async (videoId: string) => {
    setIsLoading(true);
    // The actual start logic is handled in BotActions
  };

  return (
    <div className="space-y-6">
      <BotStatus 
        twitchStatus={twitchStatus}
        youtubeStatus={youtubeStatus}
        setTwitchStatus={setTwitchStatus}
        setYoutubeStatus={setYoutubeStatus}
        onStartYouTube={handleStartYouTube}
      />
      <BotActions 
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </div>
  );
};