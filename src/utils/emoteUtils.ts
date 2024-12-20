import { emotes } from "@/components/chat/emoji-data/emotes";
import { supabase } from "@/integrations/supabase/client";

interface EmoteMetadata {
  [key: string]: string[];
}

export const createEmoteMetadata = async (message: string): Promise<EmoteMetadata> => {
  const messageWords = message.trim().split(' ');
  const emoteMetadata: EmoteMetadata = {};
  let currentPosition = 0;
  
  // Fetch channel emotes
  const { data: channelEmotes } = await supabase
    .from('twitch_channel_emotes')
    .select('id, name');
  
  console.log("[EmoteUtils] Channel emotes:", channelEmotes);
  
  messageWords.forEach((word) => {
    console.log("[EmoteUtils] Checking word for emote:", word);
    
    // Check global emotes
    const globalEmote = emotes.find(e => e.symbol === word);
    if (globalEmote) {
      console.log("[EmoteUtils] Found global emote:", globalEmote);
      if (!emoteMetadata[globalEmote.name]) {
        emoteMetadata[globalEmote.name] = [];
      }
      const start = currentPosition;
      const end = start + word.length - 1;
      emoteMetadata[globalEmote.name].push(`${start}-${end}`);
    }
    
    // Check channel emotes
    const channelEmote = channelEmotes?.find(e => e.name === word);
    if (channelEmote) {
      console.log("[EmoteUtils] Found channel emote:", channelEmote);
      const emoteKey = `channel-${channelEmote.id}`;
      if (!emoteMetadata[emoteKey]) {
        emoteMetadata[emoteKey] = [];
      }
      const start = currentPosition;
      const end = start + word.length - 1;
      emoteMetadata[emoteKey].push(`${start}-${end}`);
    }
    
    currentPosition += word.length + 1; // +1 for the space after the word
  });

  console.log("[EmoteUtils] Final emote metadata:", emoteMetadata);
  return emoteMetadata;
};