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
      const emotes = message.metadata.emotes as TwitchEmotes;
      
      // Get all positions for emotes
      let allPositions: Array<{
        start: number;
        end: number;
        emoteId: string;
        emoteText: string;
        isChannelEmote?: boolean;
      }> = [];

      // Collect all positions for all emotes
      Object.entries(emotes).forEach(([emoteId, positions]) => {
        positions.forEach(position => {
          const [start, end] = position.split('-').map(Number);
          allPositions.push({
            start,
            end,
            emoteId,
            emoteText: text.slice(start, end + 1),
            isChannelEmote: emoteId.startsWith('channel-')
          });
        });
      });

      // Sort positions by start index
      allPositions.sort((a, b) => a.start - b.start);

      console.log("[ChatMessage] All emote positions:", allPositions);

      // Build the final result
      const result: React.ReactNode[] = [];
      let lastIndex = 0;

      allPositions.forEach((pos, index) => {
        // Add text before the emote
        if (pos.start > lastIndex) {
          result.push(text.slice(lastIndex, pos.start));
        }

        // Add the emote
        if (pos.isChannelEmote) {
          // For channel emotes, use the stored URL directly
          const emoteId = pos.emoteId.replace('channel-', '');
          result.push(
            <img
              key={`${emoteId}-${pos.start}`}
              src={`https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/1.0`}
              alt={pos.emoteText}
              className="inline-block h-6 align-middle mx-0.5"
              loading="lazy"
            />
          );
        } else {
          // For global emotes
          result.push(
            <img
              key={`${pos.emoteId}-${pos.start}`}
              src={`https://static-cdn.jtvnw.net/emoticons/v2/${pos.emoteId}/default/dark/1.0`}
              alt={pos.emoteText}
              className="inline-block h-6 align-middle mx-0.5"
              loading="lazy"
            />
          );
        }

        lastIndex = pos.end + 1;
      });

      // Add any remaining text
      if (lastIndex < text.length) {
        result.push(text.slice(lastIndex));
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
            loading="lazy"
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