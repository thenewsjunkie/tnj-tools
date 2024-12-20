import React, { useEffect, useState } from 'react';
import EmoteRenderer from './EmoteRenderer';
import { supabase } from "@/integrations/supabase/client";

interface MessageContentProps {
  message: string;
  metadata?: {
    emotes?: {
      [key: string]: string[];
    };
  };
}

const MessageContent = ({ message, metadata }: MessageContentProps) => {
  const [customEmotes, setCustomEmotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchCustomEmotes = async () => {
      const { data } = await supabase
        .from('custom_emotes')
        .select('name, image_url');
      
      if (data) {
        const emoteMap = data.reduce((acc, emote) => ({
          ...acc,
          [emote.name]: emote.image_url
        }), {});
        setCustomEmotes(emoteMap);
      }
    };

    fetchCustomEmotes();
  }, []);

  if (!message) return null;

  // Handle messages with Twitch emotes
  if (metadata?.emotes) {
    console.log("[MessageContent] Processing message with emotes:", {
      message,
      metadata
    });
    
    // Get all positions for emotes
    let allPositions: Array<{
      start: number;
      end: number;
      emoteId: string;
      emoteText: string;
      isChannelEmote?: boolean;
    }> = [];

    // Collect all positions for all emotes
    Object.entries(metadata.emotes).forEach(([emoteId, positions]) => {
      positions.forEach(position => {
        const [start, end] = position.split('-').map(Number);
        const emoteText = message.slice(start, end + 1);
        
        allPositions.push({
          start,
          end,
          emoteId,
          emoteText,
          isChannelEmote: emoteId.startsWith('channel-')
        });
      });
    });

    // Sort positions by start index
    allPositions.sort((a, b) => a.start - b.start);

    console.log("[MessageContent] All emote positions:", allPositions);

    // Build the final result
    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    allPositions.forEach((pos) => {
      // Add text before the emote
      if (pos.start > lastIndex) {
        result.push(message.slice(lastIndex, pos.start));
      }

      // Add the emote
      result.push(
        <EmoteRenderer
          key={`${pos.emoteId}-${pos.start}`}
          emoteId={pos.emoteId}
          emoteText={pos.emoteText}
          isChannelEmote={pos.isChannelEmote}
        />
      );

      lastIndex = pos.end + 1;
    });

    // Add any remaining text
    if (lastIndex < message.length) {
      result.push(message.slice(lastIndex));
    }

    return <>{result}</>;
  }

  // Handle custom emotes and regular messages
  const words = message.split(' ');
  return (
    <>
      {words.map((word, index) => {
        // Check if word is a custom emote
        if (customEmotes[word]) {
          return (
            <img 
              key={index}
              src={customEmotes[word]}
              alt={word}
              className="inline-block h-6 align-middle mx-0.5"
              loading="lazy"
              onError={(e) => {
                console.error("[MessageContent] Error loading custom emote:", word);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
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
      })}
    </>
  );
};

export default MessageContent;