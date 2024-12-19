import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { MessageSquare, Settings } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import ChatMessageComponent from "@/components/chat/ChatMessage";

type ChatMessage = Tables<"chat_messages">;

const ChatModule = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [totalMessages, setTotalMessages] = useState(0);

  useEffect(() => {
    const fetchMessages = async () => {
      // Fetch total count
      const { count: totalCount } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true });

      if (totalCount !== null) {
        setTotalMessages(totalCount);
      }

      // Fetch recent messages
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
          setTotalMessages((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="w-full bg-white dark:bg-background border border-gray-200 dark:border-white/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold leading-none tracking-tight text-gray-900 dark:text-white">
            Chat
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{totalMessages}</span>
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
        <div className="max-h-[400px] overflow-y-auto space-y-1 rounded-md bg-white dark:bg-black/50">
          {messages.map((message) => (
            <ChatMessageComponent key={message.id} message={message} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatModule;