import React from 'react';
import { Button } from "@/components/ui/button";

interface EmojiGridProps {
  items: Array<{ name: string; symbol: string }>;
  onSelect: (symbol: string) => void;
}

const EmojiGrid = ({ items, onSelect }: EmojiGridProps) => {
  const renderItem = (item: { name: string; symbol: string }) => {
    // Check if this is a Twitch emote (if it has a numeric name)
    const isTwitchEmote = !isNaN(Number(item.name));

    if (isTwitchEmote) {
      return (
        <img 
          src={`https://static-cdn.jtvnw.net/emoticons/v2/${item.name}/default/dark/1.0`}
          alt={item.symbol}
          className="w-6 h-6 object-contain"
          loading="lazy"
        />
      );
    }

    return item.symbol;
  };

  return (
    <div className="grid grid-cols-8 gap-1 min-h-[300px] overflow-y-auto">
      {items.map((item) => (
        <Button
          key={item.name}
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-white/10 flex items-center justify-center"
          onClick={() => onSelect(item.symbol)}
          title={item.symbol}
        >
          {renderItem(item)}
        </Button>
      ))}
    </div>
  );
};

export default EmojiGrid;