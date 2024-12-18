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
      // Start Twitch bot
      const twitchResponse = await fetch("/functions/v1/twitch-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });

      if (!twitchResponse.ok) {
        throw new Error("Failed to start Twitch bot");
      }

      // Start YouTube bot if video ID is provided
      if (youtubeVideoId) {
        const youtubeResponse = await fetch("/functions/v1/youtube-bot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            action: "start",
            videoId: youtubeVideoId
          }),
        });

        if (!youtubeResponse.ok) {
          throw new Error("Failed to start YouTube bot");
        }
      }

      toast({
        title: "Chat bots started",
        description: "Successfully connected to chat services",
      });
    } catch (error) {
      console.error("Error starting bots:", error);
      toast({
        title: "Error",
        description: "Failed to start chat bots. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopBots = async () => {
    setIsLoading(true);
    try {
      // Stop Twitch bot
      await fetch("/functions/v1/twitch-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" }),
      });

      // Stop YouTube bot
      await fetch("/functions/v1/youtube-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "stop",
          videoId: youtubeVideoId
        }),
      });

      toast({
        title: "Chat bots stopped",
        description: "Successfully disconnected from chat services",
      });
    } catch (error) {
      console.error("Error stopping bots:", error);
      toast({
        title: "Error",
        description: "Failed to stop chat bots. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/chat"
          className="text-foreground hover:text-primary transition-colors flex items-center gap-2 mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Chat
        </Link>

        <h1 className="text-2xl font-bold mb-8">Chat Settings</h1>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">YouTube Video ID (optional)</label>
            <Input
              type="text"
              placeholder="YouTube Video ID"
              value={youtubeVideoId}
              onChange={(e) => setYoutubeVideoId(e.target.value)}
              className="bg-transparent border-white/20 max-w-xs"
            />
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="border-white/20"
              onClick={startBots}
              disabled={isLoading}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Bots
            </Button>
            <Button
              variant="outline"
              className="border-white/20"
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