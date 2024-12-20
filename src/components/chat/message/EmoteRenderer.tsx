import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface EmoteRendererProps {
  emoteId: string;
  emoteText: string;
  isChannelEmote?: boolean;
}

const EmoteRenderer = ({ emoteId, emoteText, isChannelEmote = false }: EmoteRendererProps) => {
  const [customEmoteUrl, setCustomEmoteUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCustomEmoteUrl = async () => {
      // Only fetch if it's a custom emote
      if (emoteId.startsWith('custom-')) {
        const emoteName = emoteId.replace('custom-', '');
        const { data } = await supabase
          .from('custom_emotes')
          .select('image_url')
          .eq('name', emoteName)
          .single();
        
        if (data) {
          setCustomEmoteUrl(data.image_url);
        }
      }
    };

    fetchCustomEmoteUrl();
  }, [emoteId]);
  
  // If it's a custom emote, wait for the URL
  if (emoteId.startsWith('custom-')) {
    if (!customEmoteUrl) return null;
    
    return (
      <img
        src={customEmoteUrl}
        alt={emoteText}
        className="inline-block h-6 align-middle mx-0.5"
        loading="lazy"
        onError={(e) => {
          console.error("[EmoteRenderer] Error loading custom emote:", {
            emoteId,
            error: e
          });
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    );
  }
  
  // For Twitch emotes, use the CDN
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