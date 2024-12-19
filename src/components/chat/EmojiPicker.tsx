import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { emojis } from "./emoji-data/emojis";
import { emotes } from "./emoji-data/emotes";
import EmojiGrid from "./emoji-grid/EmojiGrid";
import EmojiSearch from "./emoji-search/EmojiSearch";

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

  // Use the larger list's length to set minimum height
  const minGridHeight = Math.ceil(emojis.length / 8) * 32;

  return (
    <Tabs defaultValue="emojis">
      <TabsList className="w-full bg-white/5">
        <TabsTrigger value="emojis" className="flex-1">
          Emojis
        </TabsTrigger>
        <TabsTrigger value="emotes" className="flex-1">
          Emotes
        </TabsTrigger>
      </TabsList>
      <div className="p-2">
        <EmojiSearch value={searchQuery} onChange={setSearchQuery} />
        <TabsContent 
          value="emojis" 
          className="m-0"
          style={{ minHeight: `${minGridHeight}px` }}
        >
          <EmojiGrid items={filteredEmojis} onSelect={onEmojiSelect} />
        </TabsContent>
        <TabsContent 
          value="emotes" 
          className="m-0"
          style={{ minHeight: `${minGridHeight}px` }}
        >
          <EmojiGrid items={filteredEmotes} onSelect={onEmojiSelect} />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default EmojiPicker;