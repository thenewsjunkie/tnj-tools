import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";

type ChatMessageType = Tables<"chat_messages">;

export const MESSAGES_PER_PAGE = 100;
export const MESSAGES_TO_LOAD_MORE = 50;

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
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

      if (data.length < limit) {
        setHasMore(false);
      }

      const sortedMessages = data.reverse();
      
      setMessages(prev => {
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

  const subscribeToMessages = () => {
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
  };

  useEffect(() => {
    loadMessages(0, MESSAGES_PER_PAGE);
    return subscribeToMessages();
  }, []);

  return {
    messages,
    isLoading,
    hasMore,
    loadMessages,
  };
};