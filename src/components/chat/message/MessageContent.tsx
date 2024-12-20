import React from 'react';
import EmoteRenderer from './EmoteRenderer';

interface MessageContentProps {
  message: string;
  metadata?: {
    emotes?: {
      [key: string]: string[];
    };
  };
}

const MessageContent = ({ message, metadata }: MessageContentProps) => {
  if (!message) return null;

  // Handle messages with Twitch emotes
  if (metadata?.emotes) {
    console.log("[MessageContent] Processing message with emotes");
    
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

  // Handle custom emotes and regular messages with URLs
  const words = message.split(' ');
  return (
    <>
      {words.map((word, index) => {
        // Check if word is a custom emote URL
        if (word.startsWith('http') && (
          word.includes('/storage/v1/object/public/custom_emotes/') || 
          word.includes('/storage/v1/object/sign/custom_emotes/')
        )) {
          return (
            <img 
              key={index}
              src={word}
              alt="Custom Emote"
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