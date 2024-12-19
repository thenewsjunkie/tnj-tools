import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Emoji data
const emojis = [
  { name: "smile", symbol: "😊" },
  { name: "laugh", symbol: "😄" },
  { name: "heart", symbol: "❤️" },
  { name: "thumbsup", symbol: "👍" },
  { name: "wink", symbol: "😉" },
  { name: "cry", symbol: "😢" },
  { name: "angry", symbol: "😠" },
  { name: "surprised", symbol: "😮" },
  { name: "cool", symbol: "😎" },
  { name: "party", symbol: "🎉" },
];

// Emote data
const emotes = [
  { name: "heart", symbol: "❤️" },
  { name: "thumbsup", symbol: "👍" },
  { name: "fire", symbol: "🔥" },
  { name: "clap", symbol: "👏" },
  { name: "100", symbol: "💯" },
  { name: "star", symbol: "⭐" },
];

interface EmojiPickerProps {
  onEmojiSelect: (symbol: string) => void;
}

const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmojis = emojis.filter((emoji) =>
    emoji.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEmotes = emotes.filter((emote) =>
    emote.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Tabs defaultValue="emojis">
      <TabsList className="w-full bg-white/5">
        <TabsTrigger value="emojis" className="flex-1">Emojis</TabsTrigger>
        <TabsTrigger value="emotes" className="flex-1">Emotes</TabsTrigger>
      </TabsList>
      <div className="p-2">
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-2 bg-white/5 border-white/10 text-white placeholder:text-white/50"
        />
        <TabsContent value="emojis" className="m-0">
          <div className="grid grid-cols-6 gap-2">
            {filteredEmojis.map((emoji) => (
              <Button
                key={emoji.name}
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-white/10"
                onClick={() => onEmojiSelect(emoji.symbol)}
              >
                {emoji.symbol}
              </Button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="emotes" className="m-0">
          <div className="grid grid-cols-6 gap-2">
            {filteredEmotes.map((emote) => (
              <Button
                key={emote.name}
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-white/10"
                onClick={() => onEmojiSelect(emote.symbol)}
              >
                {emote.symbol}
              </Button>
            ))}
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default EmojiPicker;