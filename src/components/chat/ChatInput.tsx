import { useState, useEffect } from "react";
import { MessageSquare, Send, Smile, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import EmojiPicker from "./EmojiPicker";
import { ViewerCount } from "./ViewerCount";
import { createEmoteMetadata } from "@/utils/emoteUtils";

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
      console.log("[ChatInput] Processing message:", newMessage);
      
      const emoteMetadata = await createEmoteMetadata(newMessage.trim());

      const { error } = await supabase
        .from("chat_messages")
        .insert({
          source: "megachat",
          username: "MegaChat",
          message: newMessage.trim(),
          message_type: "chat",
          metadata: Object.keys(emoteMetadata).length > 0 ? { emotes: emoteMetadata } : {},
        })
        .select()
        .single();

      if (error) {
        console.error("[ChatInput] Error inserting message:", error);
        toast({
          title: "Error sending message",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setNewMessage("");
    } catch (error) {
      console.error("[ChatInput] Unexpected error:", error);
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

  const handleEmojiSelect = (symbol: string) => {
    setNewMessage((prev) => prev + symbol);
  };

  return (
    <div className="border-t border-white/10 bg-black p-2">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/90 backdrop-blur-sm px-2 py-1 rounded-md">
            <MessageSquare className="h-4 w-4 text-white/90" />
            <div className="flex items-center gap-2 text-sm font-mono text-white/90">
              <span>{totalMessages}</span>
            </div>
          </div>
          <ViewerCount />
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

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white/90 hover:text-white hover:bg-white/10"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-80 bg-black border border-white/10" 
              align="start"
              side="top"
            >
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </PopoverContent>
          </Popover>
          
          <Link to="/admin/settings/chat">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white/90 hover:text-white hover:bg-white/10"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};