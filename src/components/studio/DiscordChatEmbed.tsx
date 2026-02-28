import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DiscordMessage {
  id: string;
  author_name: string;
  author_avatar: string | null;
  content: string;
  created_at: string;
}

interface DiscordChatEmbedProps {
  zoom?: number;
}

const DiscordChatEmbed = ({ zoom = 100 }: DiscordChatEmbedProps) => {
  const [messages, setMessages] = useState<DiscordMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scale = zoom / 100;

  // Initial fetch
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("discord_messages")
        .select("id, author_name, author_avatar, content, created_at")
        .order("created_at", { ascending: true })
        .limit(100);
      if (data) setMessages(data);
    };
    fetchMessages();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("discord-chat-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "discord_messages" },
        (payload) => {
          const msg = payload.new as DiscordMessage;
          setMessages((prev) => {
            const updated = [...prev, msg];
            // Keep last 200 to prevent memory bloat
            return updated.length > 200 ? updated.slice(-200) : updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getAvatarUrl = (msg: DiscordMessage) => {
    if (msg.author_avatar) return msg.author_avatar;
    return null;
  };

  return (
    <div className="w-full h-full min-h-[400px] bg-black overflow-hidden">
      <div
        className="h-full overflow-y-auto p-3 space-y-1"
        style={{
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          width: `${100 / scale}%`,
          height: `${100 / scale}%`,
        }}
      >
        {messages.map((msg) => {
          const avatar = getAvatarUrl(msg);
          return (
            <div key={msg.id} className="flex items-start gap-2 py-1 hover:bg-white/5 rounded px-1">
              {avatar ? (
                <img
                  src={avatar}
                  alt=""
                  className="w-6 h-6 rounded-full shrink-0 mt-0.5"
                />
              ) : (
                <div className="w-6 h-6 rounded-full shrink-0 mt-0.5 bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">
                  {msg.author_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-sm font-semibold text-indigo-300">{msg.author_name}</span>
                <span className="text-[10px] text-gray-500 ml-2">{formatTime(msg.created_at)}</span>
                <p className="text-sm text-gray-200 break-words">{msg.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default DiscordChatEmbed;

