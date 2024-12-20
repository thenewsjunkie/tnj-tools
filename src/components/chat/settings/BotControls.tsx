import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BotStatusIndicator from "@/components/chat/BotStatusIndicator";
import YouTubeSettings from "@/components/chat/YouTubeSettings";
import { Twitch } from "lucide-react";

export const BotControls = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [twitchStatus, setTwitchStatus] = useState<"connected" | "disconnected">("disconnected");
  const [youtubeStatus, setYoutubeStatus] = useState<"connected" | "disconnected">("disconnected");
  const { toast } = useToast();

  const startBots = async (videoId?: string) => {
    setIsLoading(true);
    try {
      // Start Twitch bot
      const { data: twitchData, error: twitchError } = await supabase.functions.invoke('twitch-bot', {
        body: { action: "start" }
      });

      if (twitchError) {
        throw new Error(`Failed to start Twitch bot: ${twitchError.message}`);
      }

      // Verify Twitch connection
      const { data: twitchStatus } = await supabase.functions.invoke('twitch-bot', {
        body: { action: "status" }
      });

      if (twitchStatus?.status !== "connected") {
        throw new Error("Failed to establish Twitch bot connection");
      }

      // Start YouTube bot if videoId is provided
      if (videoId) {
        const { data: youtubeData, error: youtubeError } = await supabase.functions.invoke('youtube-bot', {
          body: { 
            action: "start",
            videoId: videoId
          }
        });

        if (youtubeError) {
          throw new Error(`Failed to start YouTube bot: ${youtubeError.message}`);
        }

        // Verify YouTube connection
        const { data: youtubeStatus } = await supabase.functions.invoke('youtube-bot', {
          body: { action: "status" }
        });

        if (youtubeStatus?.status !== "connected") {
          throw new Error("Failed to establish YouTube bot connection");
        }
      }

      toast({
        title: "Chat bots started",
        description: "Successfully connected to chat services",
      });
    } catch (error) {
      console.error("[ChatSettings] Error starting bots:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start chat bots. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopBots = async () => {
    setIsLoading(true);
    try {
      const [twitchResponse, youtubeResponse] = await Promise.all([
        supabase.functions.invoke('twitch-bot', {
          body: { action: "stop" }
        }),
        supabase.functions.invoke('youtube-bot', {
          body: { action: "stop" }
        })
      ]);

      if (twitchResponse.error) {
        throw new Error(`Failed to stop Twitch bot: ${twitchResponse.error.message}`);
      }

      if (youtubeResponse.error) {
        throw new Error(`Failed to stop YouTube bot: ${youtubeResponse.error.message}`);
      }

      toast({
        title: "Chat bots stopped",
        description: "Successfully disconnected from chat services",
      });
    } catch (error) {
      console.error("[ChatSettings] Error stopping bots:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to stop chat bots. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
            onStart={startBots}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          className="bg-black text-white border-gray-700 hover:bg-gray-800"
          onClick={() => startBots()}
          disabled={isLoading}
        >
          <Play className="h-4 w-4 mr-2" />
          Start Bots
        </Button>
        <Button
          variant="outline"
          className="bg-black text-white border-gray-700 hover:bg-gray-800"
          onClick={stopBots}
          disabled={isLoading}
        >
          <Square className="h-4 w-4 mr-2" />
          Stop Bots
        </Button>
      </div>
    </div>
  );
};