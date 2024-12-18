import { Youtube, Twitch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";

type ChatMessage = Tables<"chat_messages">;

interface ChatMessageProps {
  message: ChatMessage;
  isPinned?: boolean;
}

const ChatMessage = ({ message, isPinned = false }: ChatMessageProps) => {
  const renderIcon = () => {
    if (message.source === "youtube") {
      return <Youtube className="h-4 w-4 text-red-500" />;
    }
    return <Twitch className="h-4 w-4 text-purple-500" />;
  };

  const renderMessage = (text: string) => {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm",
        isPinned
          ? "bg-yellow-500/20 border border-yellow-500/50"
          : message.message_type === "superchat"
          ? "bg-green-500/20 border border-green-500/50"
          : "hover:bg-white/10"
      )}
    >
      {renderIcon()}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="font-bold text-sm whitespace-nowrap text-white">
          {message.username}:
        </span>
        {message.message_type === "superchat" && (
          <span className="text-xs text-green-400">
            ${message.superchat_amount}
          </span>
        )}
        <p className="text-sm text-white/90">{renderMessage(message.message)}</p>
      </div>
    </div>
  );
};

export default ChatMessage;