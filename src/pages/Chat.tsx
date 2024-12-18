import { useEffect, useRef, useState } from "react";
import { Search, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChatMessageComponent from "@/components/chat/ChatMessage";
import ChatStatusIndicator from "@/components/chat/ChatStatusIndicator";
import { Tables } from "@/integrations/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";

type ChatMessageType = Tables<"chat_messages">;

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedMessage, setPinnedMessage] = useState<ChatMessageType | null>(null);
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

          if (
            newMessage.message_type === "superchat" &&
            newMessage.superchat_expires_at
          ) {
            setPinnedMessage(newMessage);
            setTimeout(() => {
              setPinnedMessage(null);
            }, 60000);
          }

          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current && !isSearching) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`username.ilike.%${searchQuery}%,message.ilike.%${searchQuery}%`)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error searching messages:", error);
      return;
    }

    setMessages(data);
  };

  const resetSearch = async () => {
    setIsSearching(false);
    setSearchQuery("");
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

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      {isSearching ? (
        <div className="fixed top-0 left-0 right-0 p-4 bg-black/50 backdrop-blur-sm z-10">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by username or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-white/20"
            />
            <Button
              variant="outline"
              className="border-white/20"
              onClick={handleSearch}
            >
              Search
            </Button>
            <Button
              variant="outline"
              className="border-white/20"
              onClick={resetSearch}
            >
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      <div className="fixed top-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm p-2 rounded-lg z-20">
        <MessageSquare className="h-4 w-4" />
        <span className="text-sm font-mono">{messages.length}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSearching(!isSearching)}
          className="hover:bg-white/10"
        >
          <Search className="h-5 w-5" />
        </Button>
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

      {pinnedMessage && (
        <div className="fixed top-4 left-0 right-0 p-4 bg-black/50 backdrop-blur-sm">
          <ChatMessageComponent message={pinnedMessage} isPinned />
        </div>
      )}

      <ChatStatusIndicator />
    </div>
  );
};

export default Chat;