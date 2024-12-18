import { useEffect, useRef, useState } from "react";
import { Search, MessageSquare, Play, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import ChatMessageComponent from "@/components/chat/ChatMessage";
import { Tables } from "@/integrations/supabase/types";

type ChatMessageType = Tables<"chat_messages">;

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedMessage, setPinnedMessage] = useState<ChatMessageType | null>(null);
  const [youtubeVideoId, setYoutubeVideoId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initial fetch of messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages(data.reverse());
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel("chat_messages_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMessage = payload.new as ChatMessageType;
          setMessages((prev) => [...prev, newMessage]);

          // Handle superchat pinning
          if (
            newMessage.message_type === "superchat" &&
            newMessage.superchat_expires_at
          ) {
            setPinnedMessage(newMessage);
            setTimeout(() => {
              setPinnedMessage(null);
            }, 60000); // 60 seconds
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messagesEndRef.current && !isSearching) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSearching]);

  const handleSearch = async () => {
    if (!searchQuery) return;

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`username.ilike.%${searchQuery}%,message.ilike.%${searchQuery}%`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching messages:", error);
      return;
    }

    setMessages(data.reverse());
  };

  const resetSearch = async () => {
    setIsSearching(false);
    setSearchQuery("");
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(data.reverse());
  };

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
    <div className="min-h-screen bg-transparent text-white">
      {isSearching ? (
        <div className="fixed top-0 left-0 right-0 p-4 bg-black/50 backdrop-blur-sm z-10">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by username or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-white/20"
            />
            <Button
              variant="outline"
              className="border-white/20"
              onClick={handleSearch}
            >
              Search
            </Button>
            <Button
              variant="outline"
              className="border-white/20"
              onClick={resetSearch}
            >
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      <div className="fixed top-0 left-0 right-0 p-4 bg-black/50 backdrop-blur-sm z-10 flex items-center gap-4">
        <Input
          type="text"
          placeholder="YouTube Video ID (optional)"
          value={youtubeVideoId}
          onChange={(e) => setYoutubeVideoId(e.target.value)}
          className="bg-transparent border-white/20 max-w-xs"
        />
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

      <div
        ref={containerRef}
        className="pb-16 pt-24 px-4 overflow-y-auto space-y-4"
        style={{ height: "calc(100vh - 4rem)" }}
      >
        {pinnedMessage && (
          <div className="fixed top-20 left-0 right-0 p-4 bg-black/50 backdrop-blur-sm">
            <ChatMessageComponent message={pinnedMessage} isPinned />
          </div>
        )}

        <div className="fixed top-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm p-2 rounded-lg z-20">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm font-mono">{messages.length}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearching(!isSearching)}
            className="hover:bg-white/10"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {messages.map((message) => (
          <ChatMessageComponent key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Chat;
