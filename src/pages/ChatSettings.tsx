import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const ChatSettings = () => {
  const [youtubeVideoId, setYoutubeVideoId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startBots = async () => {
    setIsLoading(true);
    try {
      console.log("[ChatSettings] Starting bots...");
      
      // Start Twitch bot
      console.log("[ChatSettings] Starting Twitch bot...");
      const twitchResponse = await fetch("/functions/v1/twitch-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });

      console.log("[ChatSettings] Twitch bot response status:", twitchResponse.status);
      const twitchData = await twitchResponse.text();
      console.log("[ChatSettings] Twitch bot response:", twitchData);

      if (!twitchResponse.ok) {
        throw new Error(`Failed to start Twitch bot: ${twitchData}`);
      }

      // Start YouTube bot if video ID is provided
      if (youtubeVideoId) {
        console.log("[ChatSettings] Starting YouTube bot for video:", youtubeVideoId);
        const youtubeResponse = await fetch("/functions/v1/youtube-bot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            action: "start",
            videoId: youtubeVideoId
          }),
        });

        console.log("[ChatSettings] YouTube bot response status:", youtubeResponse.status);
        const youtubeData = await youtubeResponse.text();
        console.log("[ChatSettings] YouTube bot response:", youtubeData);

        if (!youtubeResponse.ok) {
          throw new Error(`Failed to start YouTube bot: ${youtubeData}`);
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
      console.log("[ChatSettings] Stopping bots...");
      
      // Stop Twitch bot
      console.log("[ChatSettings] Stopping Twitch bot...");
      const twitchResponse = await fetch("/functions/v1/twitch-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" }),
      });

      console.log("[ChatSettings] Twitch bot stop response status:", twitchResponse.status);
      const twitchData = await twitchResponse.text();
      console.log("[ChatSettings] Twitch bot stop response:", twitchData);

      if (!twitchResponse.ok) {
        throw new Error(`Failed to stop Twitch bot: ${twitchData}`);
      }

      // Stop YouTube bot
      console.log("[ChatSettings] Stopping YouTube bot...");
      const youtubeResponse = await fetch("/functions/v1/youtube-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "stop",
          videoId: youtubeVideoId
        }),
      });

      console.log("[ChatSettings] YouTube bot stop response status:", youtubeResponse.status);
      const youtubeData = await youtubeResponse.text();
      console.log("[ChatSettings] YouTube bot stop response:", youtubeData);

      if (!youtubeResponse.ok) {
        throw new Error(`Failed to stop YouTube bot: ${youtubeData}`);
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
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link
          to="/chat"
          className="text-red-500 hover:text-red-400 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Chat
        </Link>

        <h1 className="text-2xl font-bold">Chat Settings</h1>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">YouTube Video ID (optional)</label>
            <Input
              type="text"
              placeholder="YouTube Video ID"
              value={youtubeVideoId}
              onChange={(e) => setYoutubeVideoId(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 max-w-xs"
            />
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="border-gray-700 hover:bg-gray-800 text-white"
              onClick={startBots}
              disabled={isLoading}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Bots
            </Button>
            <Button
              variant="outline"
              className="border-gray-700 hover:bg-gray-800 text-white"
              onClick={stopBots}
              disabled={isLoading}
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Bots
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSettings;