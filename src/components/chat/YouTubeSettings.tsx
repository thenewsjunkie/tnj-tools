import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchLiveStreamId } from "@/utils/youtubeUtils";

interface YouTubeSettingsProps {
  status: "connected" | "disconnected";
  onStart: (videoId: string) => Promise<void>;
}

const YouTubeSettings = ({ status, onStart }: YouTubeSettingsProps) => {
  const [youtubeVideoId, setYoutubeVideoId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAutoFetch = async () => {
    setIsLoading(true);
    try {
      const { data: { api_key, channel_id }, error } = await supabase.functions.invoke('youtube-bot', {
        body: { action: "get-config" }
      });

      if (error) throw error;

      const videoId = await fetchLiveStreamId(channel_id, api_key);
      
      if (!videoId) {
        toast({
          title: "No live stream found",
          description: "Could not find an active live stream for the channel",
          variant: "destructive",
        });
        return;
      }

      setYoutubeVideoId(videoId);
      await onStart(videoId);
    } catch (error) {
      console.error("[YouTubeSettings] Error auto-fetching stream:", error);
      toast({
        title: "Error",
        description: "Failed to fetch live stream. Please try again or enter ID manually.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Youtube className="h-5 w-5 text-red-500" />
      <span>YouTube:</span>
      <div
        className={`h-2 w-2 rounded-full ${
          status === "connected" ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className="text-sm text-gray-400">
        {status === "connected" ? "Connected" : "Disconnected"}
      </span>
      <div className="flex gap-2 ml-4">
        <Input
          type="text"
          placeholder="YouTube Video ID"
          value={youtubeVideoId}
          onChange={(e) => setYoutubeVideoId(e.target.value)}
          className="bg-gray-900 border-gray-700 text-white placeholder-gray-400 max-w-xs"
        />
        <Button
          variant="outline"
          className="border-gray-700 hover:bg-gray-800 text-white"
          onClick={handleAutoFetch}
          disabled={isLoading}
        >
          Auto-fetch
        </Button>
      </div>
    </div>
  );
};

export default YouTubeSettings;