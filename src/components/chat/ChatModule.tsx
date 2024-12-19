import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { MessageSquare, Settings, Youtube, Twitch } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import ChatMessageComponent from "@/components/chat/ChatMessage";
import { useToast } from "@/hooks/use-toast";

type ChatMessage = Tables<"chat_messages">;

const ChatModule = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [twitchStatus, setTwitchStatus] = useState<"connected" | "disconnected">("disconnected");
  const [youtubeStatus, setYoutubeStatus] = useState<"connected" | "disconnected">("disconnected");
  const { toast } = useToast();

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages(data.reverse());
    };

    fetchMessages();

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
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => [...prev.slice(-9), newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const startBots = async () => {
    try {
      await supabase.functions.invoke('twitch-bot', {
        body: { action: "start" }
      });

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
    }
  };

  const stopBots = async () => {
    try {
      await Promise.all([
        supabase.functions.invoke('twitch-bot', {
          body: { action: "stop" }
        }),
        supabase.functions.invoke('youtube-bot', {
          body: { action: "stop" }
        })
      ]);

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
    }
  };

  return (
    <Card className="w-full bg-background border border-gray-200 dark:border-white/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold leading-none tracking-tight">Chat</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{messages.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/chat">View Chat</Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/chat/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-[400px] overflow-y-auto space-y-1">
          {messages.map((message) => (
            <ChatMessageComponent key={message.id} message={message} />
          ))}
        </div>
        <div className="flex justify-end items-center gap-4 pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${twitchStatus === "connected" ? "bg-green-500" : "bg-red-500"}`} />
            <Twitch className="h-5 w-5 text-purple-500" />
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${youtubeStatus === "connected" ? "bg-green-500" : "bg-red-500"}`} />
            <Youtube className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={startBots}
              className="text-green-500 hover:text-green-600"
            >
              Start Bots
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={stopBots}
              className="text-red-500 hover:text-red-600"
            >
              Stop Bots
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatModule;