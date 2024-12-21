import { useState } from "react";
import { BotStatus } from "./bot-controls/BotStatus";
import { BotActions } from "./bot-controls/BotActions";

export const BotControls = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [twitchStatus, setTwitchStatus] = useState<"connected" | "disconnected">("disconnected");
  const [youtubeStatus, setYoutubeStatus] = useState<"connected" | "disconnected">("disconnected");

  return (
    <div className="space-y-6">
      <BotStatus 
        twitchStatus={twitchStatus}
        youtubeStatus={youtubeStatus}
        setTwitchStatus={setTwitchStatus}
        setYoutubeStatus={setYoutubeStatus}
        onStartYouTube={(videoId) => {
          setIsLoading(true);
          // The actual start logic is handled in BotActions
        }}
      />
      <BotActions 
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </div>
  );
};
