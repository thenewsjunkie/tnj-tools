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

const MESSAGES_PER_PAGE = 100;
const MESSAGES_TO_LOAD_MORE = 50;

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const lastScrollTop = useRef(0);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();

  const loadMessages = async (offset: number, limit: number) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error loading messages",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // If we got fewer messages than requested, there are no more to load
      if (data.length < limit) {
        setHasMore(false);
      }

      // Reverse the messages to show them in chronological order
      const sortedMessages = data.reverse();
      
      setMessages(prev => {
        // Combine existing messages with new ones, removing duplicates
        const combined = [...prev, ...sortedMessages];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        return unique.sort((a, b) => 
          new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
        );
      });
    } catch (error) {
      console.error("Unexpected error loading messages:", error);
      toast({
        title: "Error loading messages",
        description: "An unexpected error occurred while loading messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const isAtBottom =
      Math.abs(
        element.scrollHeight - element.scrollTop - element.clientHeight
      ) < 10;
    
    // Check if we're at the top and should load more
    if (element.scrollTop === 0 && !isLoading && hasMore) {
      loadMessages(messages.length, MESSAGES_TO_LOAD_MORE);
    }

    setAutoScroll(isAtBottom);
    lastScrollTop.current = element.scrollTop;
  };

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
          username: "User",
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
    loadMessages(0, MESSAGES_PER_PAGE);

    // Set up real-time subscription
    const channel = supabase
      .channel("chat_messages_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
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
  }, []);

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col">
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 bg-primary/10 text-center py-1 text-sm">
          Loading more messages...
        </div>
      )}
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