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
    if (chatContainerRef.current && autoScroll) {
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

      if (error) {
        console.error("Error inserting message:", error);
        toast({
          title: "Error sending message",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log("Message inserted successfully:", data);
      setNewMessage("");
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error sending message",
        description: "An unexpected error occurred",
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
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching messages:", error);
          toast({
            title: "Error loading messages",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        console.log(`Loaded ${data.length} messages`);
        setMessages(data || []);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Unexpected error loading messages:", error);
        toast({
          title: "Error loading messages",
          description: "An unexpected error occurred while loading messages",
          variant: "destructive",
        });
      }
    };

    fetchMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel("chat_messages_changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          console.log("Real-time event received:", payload);
          
          if (payload.eventType === "INSERT") {
            setMessages((prev) => [...prev, payload.new as ChatMessageType]);
            setTimeout(scrollToBottom, 100);
          } else if (payload.eventType === "DELETE") {
            setMessages((prev) => 
              prev.filter((msg) => msg.id !== payload.old.id)
            );
          } else if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === payload.new.id ? (payload.new as ChatMessageType) : msg
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

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
            {messages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-1.5 bg-black/90 backdrop-blur-sm px-2 py-1 rounded-md">
            <MessageSquare className="h-4 w-4 text-white/90" />
            <span className="text-sm font-mono text-white/90">Chat Messages: {messages.length}</span>
          </div>
          
          <div className="flex gap-2">
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
      </div>

      <ChatStatusIndicator />
    </div>
  );
};

export default Chat;