import { emotes } from "@/components/chat/emoji-data/emotes";

interface EmoteMetadata {
  [key: string]: string[];
}

export const createEmoteMetadata = (message: string): EmoteMetadata => {
  const messageWords = message.trim().split(' ');
  const emoteMetadata: EmoteMetadata = {};
  let currentPosition = 0;
  
  messageWords.forEach((word) => {
    console.log("[EmoteUtils] Checking word for emote:", word);
    const emote = emotes.find(e => e.symbol === word);
    if (emote) {
      console.log("[EmoteUtils] Found emote:", emote);
      if (!emoteMetadata[emote.name]) {
        emoteMetadata[emote.name] = [];
      }
      const start = currentPosition;
      const end = start + word.length - 1;
      emoteMetadata[emote.name].push(`${start}-${end}`);
    }
    currentPosition += word.length + 1; // +1 for the space after the word
  });

  console.log("[EmoteUtils] Final emote metadata:", emoteMetadata);
  return emoteMetadata;
};