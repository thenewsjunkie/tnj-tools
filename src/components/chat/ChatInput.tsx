import { useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const ChatInput = () => {
  const [newMessage, setNewMessage] = useState("");
  const [totalMessages, setTotalMessages] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTotalMessages = async () => {
      const { count: totalCount } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true });

      if (totalCount !== null) {
        setTotalMessages(totalCount);
      }
    };

    fetchTotalMessages();

    const channel = supabase
      .channel("chat_messages_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        () => {
          setTotalMessages((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
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

  return (
    <div className="border-t border-white/10 bg-black p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-1.5 bg-black/90 backdrop-blur-sm px-2 py-1 rounded-md">
          <MessageSquare className="h-4 w-4 text-white/90" />
          <div className="flex items-center gap-2 text-sm font-mono text-white/90">
            <span>{totalMessages}</span>
          </div>
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
  );
};