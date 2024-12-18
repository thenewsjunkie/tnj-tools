import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

const ChatStatusIndicator = () => {
  const [status, setStatus] = useState<"connected" | "disconnected">("disconnected");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const [twitchResponse, youtubeResponse] = await Promise.all([
          fetch("/functions/v1/twitch-bot", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
          fetch("/functions/v1/youtube-bot", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }),
        ]);

        if (twitchResponse.ok || youtubeResponse.ok) {
          setStatus("connected");
        } else {
          setStatus("disconnected");
        }
      } catch (error) {
        console.error("Error checking bot status:", error);
        setStatus("disconnected");
      }
    };

    // Check status initially and every 30 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm p-2 rounded-lg">
      <div
        className={`h-2 w-2 rounded-full ${
          status === "connected" ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <Link to="/chat/settings">
        <Settings className="h-5 w-5 hover:text-primary transition-colors" />
      </Link>
    </div>
  );
};

export default ChatStatusIndicator;