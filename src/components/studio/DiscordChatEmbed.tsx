import { useEffect, useRef, useState, useCallback } from "react";
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

  const mergeMessages = useCallback((existing: DiscordMessage[], incoming: DiscordMessage[]) => {
    const map = new Map<string, DiscordMessage>();
    for (const m of existing) map.set(m.id, m);
    for (const m of incoming) map.set(m.id, m);
    return Array.from(map.values())
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-200);
  }, []);

  // Initial fetch + polling fallback
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("discord_messages")
        .select("id, author_name, author_avatar, content, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (data) {
        setMessages((prev) => mergeMessages(prev, data));
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [mergeMessages]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("discord-chat-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "discord_messages" },
        (payload) => {
          const msg = payload.new as DiscordMessage;
          setMessages((prev) => mergeMessages(prev, [msg]));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mergeMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="w-full h-full min-h-[400px] bg-black overflow-hidden">
      <div
        className="h-full overflow-y-auto flex flex-col justify-end"
        style={{
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          width: `${100 / scale}%`,
          height: `${100 / scale}%`,
        }}
      >
        <div className="p-3 space-y-1">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2 py-1 hover:bg-white/5 rounded px-1">
              {msg.author_avatar ? (
                <img
                  src={msg.author_avatar}
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
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};

export default DiscordChatEmbed;
