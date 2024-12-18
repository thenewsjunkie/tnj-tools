import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Play, Square, Search, Twitch, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ChatMessageComponent from "@/components/chat/ChatMessage";
import YouTubeSettings from "@/components/chat/YouTubeSettings";
import BotStatusIndicator from "@/components/chat/BotStatusIndicator";

const ChatSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [twitchStatus, setTwitchStatus] = useState<"connected" | "disconnected">("disconnected");
  const [youtubeStatus, setYoutubeStatus] = useState<"connected" | "disconnected">("disconnected");
  const { toast } = useToast();

  const startBots = async (videoId?: string) => {
    setIsLoading(true);
    try {
      console.log("[ChatSettings] Starting bots...");
      
      // Start Twitch bot
      console.log("[ChatSettings] Starting Twitch bot...");
      const { data: twitchData, error: twitchError } = await supabase.functions.invoke('twitch-bot', {
        body: { action: "start" }
      });

      if (twitchError) {
        throw new Error(`Failed to start Twitch bot: ${twitchError.message}`);
      }

      // Start YouTube bot if video ID is provided
      if (videoId) {
        console.log("[ChatSettings] Starting YouTube bot for video:", videoId);
        const { data: youtubeData, error: youtubeError } = await supabase.functions.invoke('youtube-bot', {
          body: { 
            action: "start",
            videoId: videoId
          }
        });

        if (youtubeError) {
          throw new Error(`Failed to start YouTube bot: ${youtubeError.message}`);
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

  const handleSearch = async () => {
    if (!searchQuery) return;

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`username.ilike.%${searchQuery}%,message.ilike.%${searchQuery}%`)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error searching messages:", error);
      toast({
        title: "Error",
        description: "Failed to search messages. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setMessages(data);
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
              className="border-gray-700 hover:bg-gray-800 text-white"
              onClick={() => startBots()}
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

        <div className="space-y-4 pt-8 border-t border-gray-800">
          <h2 className="text-xl font-semibold">Search Messages</h2>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by username or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-400"
            />
            <Button
              variant="outline"
              className="border-gray-700 hover:bg-gray-800 text-white"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {messages.length > 0 && (
            <div className="space-y-2 mt-4">
              <h3 className="text-lg font-semibold">Search Results</h3>
              <div className="space-y-1 bg-gray-900 rounded-lg p-4">
                {messages.map((message) => (
                  <ChatMessageComponent key={message.id} message={message} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSettings;
