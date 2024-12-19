import { Youtube, Twitch, MessageSquare } from "lucide-react";
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
      return <Youtube className="h-4 w-4 text-red-500 shrink-0" />;
    }
    if (message.source === "twitch") {
      return <Twitch className="h-4 w-4 text-purple-500 shrink-0" />;
    }
    if (message.source === "megachat") {
      return <MessageSquare className="h-4 w-4 text-blue-500 shrink-0" />;
    }
    return <MessageSquare className="h-4 w-4 text-blue-500 shrink-0" />;
  };

  const renderMessage = (text: string) => {
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
            className="text-blue-400 hover:underline break-all"
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
        "flex items-start gap-2 px-2 py-1 bg-black/50 backdrop-blur-sm w-full",
        isPinned
          ? "bg-yellow-500/20 border border-yellow-500/50"
          : message.message_type === "superchat"
          ? "bg-green-500/20 border border-green-500/50"
          : ""
      )}
    >
      {renderIcon()}
      <div className="flex min-w-0 w-full">
        <span className="font-bold text-sm whitespace-nowrap text-white shrink-0 mr-2">
          {message.username}:
        </span>
        <div className="flex-1 min-w-0">
          {message.message_type === "superchat" && (
            <span className="text-xs text-green-400 mr-2 shrink-0">
              ${message.superchat_amount}
            </span>
          )}
          <p className="text-sm text-white/90 break-words">
            {renderMessage(message.message)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;