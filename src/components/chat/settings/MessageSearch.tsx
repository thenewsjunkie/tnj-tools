import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ChatMessageComponent from "@/components/chat/ChatMessage";
import type { Tables } from "@/integrations/supabase/types";

type ChatMessage = Tables<"chat_messages">;

export const MessageSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery) return;

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`username.ilike.%${searchQuery}%,message.ilike.%${searchQuery}%`)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error searching messages:", error);
      toast({
        title: "Error",
        description: "Failed to search messages. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setMessages(data);
  };

  const handleDelete = async (messageId: string) => {
    const { error } = await supabase
      .from("chat_messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setMessages(messages.filter(msg => msg.id !== messageId));
    toast({
      title: "Success",
      description: "Message deleted successfully",
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Search Messages</h2>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search by username or message..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-gray-900 border-gray-700 text-white placeholder-gray-400"
        />
        <Button
          variant="outline"
          className="bg-black text-white border-gray-700 hover:bg-gray-800"
          onClick={handleSearch}
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {messages.length > 0 && (
        <div className="space-y-2 mt-4">
          <h3 className="text-lg font-semibold">Search Results</h3>
          <div className="space-y-1 bg-gray-900 rounded-lg p-4">
            {messages.map((message) => (
              <div key={message.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <ChatMessageComponent message={message} />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  onClick={() => handleDelete(message.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};