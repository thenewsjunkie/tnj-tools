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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const lastScrollTop = useRef(0);

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
          if (autoScroll) {
            scrollToBottom();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [autoScroll]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const isScrollingUp = element.scrollTop < lastScrollTop.current;
    const isAtBottom = Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) < 10;
    
    setAutoScroll(isAtBottom);
    lastScrollTop.current = element.scrollTop;
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      <div className="fixed top-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm p-2 rounded-lg z-20">
        <MessageSquare className="h-4 w-4" />
        <span className="text-sm font-mono">{messages.length}</span>
      </div>

      <div 
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        <div className="min-h-screen flex flex-col justify-end p-4">
          <div className="w-full max-w-4xl mx-auto space-y-1">
            {messages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))}
          </div>
        </div>
      </div>

      <ChatStatusIndicator />
    </div>
  );
};

export default Chat;