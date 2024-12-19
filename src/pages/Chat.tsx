import { useEffect, useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ChatMessageComponent from "@/components/chat/ChatMessage";
import ChatStatusIndicator from "@/components/chat/ChatStatusIndicator";
import { Tables } from "@/integrations/supabase/types";

type ChatMessageType = Tables<"chat_messages">;

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const lastScrollTop = useRef(0);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Initial messages load
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
      // Scroll to bottom after initial load
      setTimeout(scrollToBottom, 100);
    };

    fetchMessages();
  }, []);

  // Real-time updates
  useEffect(() => {
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
            setTimeout(scrollToBottom, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [autoScroll]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const isAtBottom =
      Math.abs(
        element.scrollHeight - element.scrollTop - element.clientHeight
      ) < 10;
    
    setAutoScroll(isAtBottom);
    lastScrollTop.current = element.scrollTop;
  };

  return (
    <div className="fixed inset-0 bg-transparent text-white flex flex-col">
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative"
      >
        <div className="min-h-full flex flex-col justify-end p-4">
          <div className="w-full max-w-4xl mx-auto relative">
            <div className="absolute top-0 right-0 flex items-center gap-1.5 bg-black/90 backdrop-blur-sm px-2 py-1 rounded-md z-20 border border-white/20">
              <span className="text-sm font-mono text-white/90">{messages.length}</span>
            </div>
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