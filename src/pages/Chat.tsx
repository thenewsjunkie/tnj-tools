import { useEffect, useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ChatMessageComponent from "@/components/chat/ChatMessage";
import ChatStatusIndicator from "@/components/chat/ChatStatusIndicator";
import { Tables } from "@/integrations/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";

type ChatMessageType = Tables<"chat_messages">;

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages(data);
      scrollToBottom();
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
          const newMessage = payload.new as ChatMessageType;
          setMessages((prev) => [...prev, newMessage]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      <div className="fixed top-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm p-2 rounded-lg z-20">
        <MessageSquare className="h-4 w-4" />
        <span className="text-sm font-mono">{messages.length}</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="min-h-screen flex flex-col justify-end p-4">
          <div>
            {messages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </ScrollArea>

      <ChatStatusIndicator />
    </div>
  );
};

export default Chat;