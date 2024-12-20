import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface EmoteRendererProps {
  emoteId: string;
  emoteText: string;
  isChannelEmote?: boolean;
}

const EmoteRenderer = ({ emoteId, emoteText, isChannelEmote = false }: EmoteRendererProps) => {
  const [customEmoteUrl, setCustomEmoteUrl] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchCustomEmoteUrl = async () => {
      // Only fetch if it's a custom emote
      if (emoteId.startsWith('custom-')) {
        const emoteName = emoteId.replace('custom-', '');
        console.log("[EmoteRenderer] Fetching custom emote:", emoteName);
        
        try {
          const { data, error: supabaseError } = await supabase
            .from('custom_emotes')
            .select('image_url')
            .eq('name', emoteName)
            .single();
          
          if (supabaseError) {
            console.error("[EmoteRenderer] Supabase error:", supabaseError);
            setError(true);
            return;
          }
          
          if (data) {
            console.log("[EmoteRenderer] Found custom emote URL:", data.image_url);
            setCustomEmoteUrl(data.image_url);
          } else {
            console.error("[EmoteRenderer] No custom emote found for:", emoteName);
            setError(true);
          }
        } catch (err) {
          console.error("[EmoteRenderer] Failed to fetch custom emote:", err);
          setError(true);
        }
      }
    };

    fetchCustomEmoteUrl();
  }, [emoteId]);
  
  // If it's a custom emote, wait for the URL
  if (emoteId.startsWith('custom-')) {
    if (error) {
      console.log("[EmoteRenderer] Rendering text fallback due to error:", emoteText);
      return <span>{emoteText}</span>;
    }
    
    if (!customEmoteUrl) {
      console.log("[EmoteRenderer] Waiting for custom emote URL...");
      return null;
    }
    
    return (
      <img
        src={customEmoteUrl}
        alt={emoteText}
        className="inline-block h-6 align-middle mx-0.5"
        loading="lazy"
        onError={(e) => {
          console.error("[EmoteRenderer] Error loading custom emote image:", {
            emoteId,
            url: customEmoteUrl,
            error: e
          });
          setError(true);
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