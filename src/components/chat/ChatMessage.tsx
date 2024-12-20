import React from 'react';
import { Youtube, Twitch, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";
import MessageContent from './message/MessageContent';

type ChatMessageType = Tables<"chat_messages">;

interface ChatMessageProps {
  message: ChatMessageType;
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
    return <MessageSquare className="h-4 w-4 text-blue-500 shrink-0" />;
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
      <div className="pt-1">{renderIcon()}</div>
      <div className="min-w-0 flex-1">
        <span className="inline-block font-bold text-sm text-white mr-2">
          {message.username}:
        </span>
        {message.message_type === "superchat" && (
          <span className="inline-block text-xs text-green-400 mr-2">
            ${message.superchat_amount}
          </span>
        )}
        <span className="inline text-sm text-white/90 break-words">
          <MessageContent 
            message={message.message} 
            metadata={message.metadata as { emotes?: { [key: string]: string[] } }}
          />
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;