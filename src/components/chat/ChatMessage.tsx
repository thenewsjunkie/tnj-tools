import React from 'react';
import { Youtube, Twitch, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";

type ChatMessageType = Tables<"chat_messages">;

interface ChatMessageProps {
  message: ChatMessageType;
  isPinned?: boolean;
}

interface TwitchEmotes {
  [key: string]: string[];
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
    console.log("[ChatMessage] Rendering message:", text);
    console.log("[ChatMessage] Message metadata:", message.metadata);

    if (!text) return "";

    // Handle Twitch emotes if present in metadata
    if (typeof message.metadata === 'object' && message.metadata !== null && 'emotes' in message.metadata) {
      console.log("[ChatMessage] Processing message with emotes");
      let result: React.ReactNode = text;
      const emotes = message.metadata.emotes as TwitchEmotes;
      
      // Sort emotes by position to replace from end to start
      const sortedEmotes = Object.entries(emotes).sort((a, b) => {
        const posA = parseInt(a[1][0].split('-')[0]);
        const posB = parseInt(b[1][0].split('-')[0]);
        return posB - posA;
      });

      console.log("[ChatMessage] Sorted emotes:", sortedEmotes);

      for (const [emoteId, positions] of sortedEmotes) {
        for (const position of positions) {
          const [start, end] = position.split('-').map(Number);
          const emoteText = text.slice(start, end + 1);
          console.log("[ChatMessage] Replacing emote:", emoteText, "with ID:", emoteId);
          
          // Create img element for emote
          const emoteImg = (
            <img 
              key={`${emoteId}-${start}`}
              src={`https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/1.0`}
              alt={emoteText}
              className="inline-block h-6 align-middle mx-0.5"
            />
          );
          
          // Replace text with emote image
          const before = result.toString().slice(0, start);
          const after = result.toString().slice(end + 1);
          result = (
            <React.Fragment>
              {before}
              {emoteImg}
              {after}
            </React.Fragment>
          );
        }
      }

      return result;
    }

    // Handle custom emotes and regular messages with URLs
    const words = text.split(' ');
    return words.map((word, index) => {
      // Check if word is a custom emote URL
      if (word.startsWith('http') && (word.includes('/storage/v1/object/public/custom_emotes/') || word.includes('/storage/v1/object/sign/custom_emotes/'))) {
        return (
          <img 
            key={index}
            src={word}
            alt="Custom Emote"
            className="inline-block h-6 align-middle mx-0.5"
          />
        );
      }
      
      // Handle URLs
      if (word.match(/(https?:\/\/[^\s]+)/g)) {
        return (
          <React.Fragment key={index}>
            <a
              href={word}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline break-all"
            >
              {word}
            </a>
            {' '}
          </React.Fragment>
        );
      }
      
      // Regular word
      return <React.Fragment key={index}>{word} </React.Fragment>;
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
          {renderMessage(message.message)}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;