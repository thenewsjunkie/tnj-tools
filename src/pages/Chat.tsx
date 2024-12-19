import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ChatMessageComponent from "@/components/chat/ChatMessage";
import ChatStatusIndicator from "@/components/chat/ChatStatusIndicator";
import { Tables } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type ChatMessageType = Tables<"chat_messages">;

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const lastScrollTop = useRef(0);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          source: "megachat",
          username: "MegaChat",
          message: newMessage.trim(),
          message_type: "chat",
        })
        .select()
        .single();

      if (error) throw error;

      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
    <div className="fixed inset-0 bg-black text-white flex flex-col">
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        <div className="min-h-full p-4">
          <div className="w-full max-w-4xl mx-auto space-y-2">
            <div className="flex items-center gap-1.5 bg-black/90 backdrop-blur-sm px-2 py-1 rounded-md border border-white/20 mb-4">
              <MessageSquare className="h-4 w-4 text-white/90" />
              <span className="text-sm font-mono text-white/90">Chat Messages: {messages.length}</span>
            </div>
            {messages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="bg-white/5 border-white/10 text-white"
          />
          <Button 
            onClick={handleSendMessage}
            className="bg-white/10 hover:bg-white/20"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ChatStatusIndicator />
    </div>
  );
};

export default Chat;