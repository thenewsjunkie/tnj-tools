import React from 'react';

interface EmoteRendererProps {
  emoteId: string;
  emoteText: string;
  isChannelEmote?: boolean;
}

const EmoteRenderer = ({ emoteId, emoteText, isChannelEmote = false }: EmoteRendererProps) => {
  // For channel emotes, we need to remove the 'channel-' prefix
  const actualEmoteId = isChannelEmote ? emoteId.replace('channel-', '') : emoteId;
  
  console.log(`[EmoteRenderer] Rendering ${isChannelEmote ? 'channel' : 'global'} emote:`, {
    originalId: emoteId,
    processedId: actualEmoteId,
    text: emoteText
  });
  
  return (
    <img
      src={`https://static-cdn.jtvnw.net/emoticons/v2/${actualEmoteId}/default/dark/1.0`}
      alt={emoteText}
      className="inline-block h-6 align-middle mx-0.5"
      loading="lazy"
      onError={(e) => {
        console.error("[EmoteRenderer] Error loading emote:", {
          emoteId: actualEmoteId,
          error: e
        });
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
      }}
    />
  );
};

export default EmoteRenderer;