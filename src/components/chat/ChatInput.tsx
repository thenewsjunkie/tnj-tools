import { useState, useEffect } from "react";
import { MessageSquare, Send, Smile } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

// Emoji data
const emojis = [
  { name: "smile", symbol: "😊" },
  { name: "laugh", symbol: "😄" },
  { name: "heart", symbol: "❤️" },
  { name: "thumbsup", symbol: "👍" },
  { name: "wink", symbol: "😉" },
  { name: "cry", symbol: "😢" },
  { name: "angry", symbol: "😠" },
  { name: "surprised", symbol: "😮" },
  { name: "cool", symbol: "😎" },
  { name: "party", symbol: "🎉" },
];

// Emote data
const emotes = [
  { name: "heart", symbol: "❤️" },
  { name: "thumbsup", symbol: "👍" },
  { name: "fire", symbol: "🔥" },
  { name: "clap", symbol: "👏" },
  { name: "100", symbol: "💯" },
  { name: "star", symbol: "⭐" },
];

export const ChatInput = () => {
  const [newMessage, setNewMessage] = useState("");
  const [totalMessages, setTotalMessages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleEmojiClick = (symbol: string) => {
    setNewMessage((prev) => prev + symbol);
  };

  const filteredEmojis = emojis.filter((emoji) =>
    emoji.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEmotes = emotes.filter((emote) =>
    emote.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="border-t border-white/10 bg-black p-2">
      <div className="space-y-2">
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
              <Tabs defaultValue="emojis">
                <TabsList className="w-full bg-white/5">
                  <TabsTrigger value="emojis" className="flex-1">Emojis</TabsTrigger>
                  <TabsTrigger value="emotes" className="flex-1">Emotes</TabsTrigger>
                </TabsList>
                <div className="p-2">
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-2 bg-white/5 border-white/10"
                  />
                  <TabsContent value="emojis" className="m-0">
                    <div className="grid grid-cols-6 gap-2">
                      {filteredEmojis.map((emoji) => (
                        <Button
                          key={emoji.name}
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-white/10"
                          onClick={() => handleEmojiClick(emoji.symbol)}
                        >
                          {emoji.symbol}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="emotes" className="m-0">
                    <div className="grid grid-cols-6 gap-2">
                      {filteredEmotes.map((emote) => (
                        <Button
                          key={emote.name}
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-white/10"
                          onClick={() => handleEmojiClick(emote.symbol)}
                        >
                          {emote.symbol}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};