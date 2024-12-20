import React from 'react';
import { Button } from "@/components/ui/button";

interface EmojiGridProps {
  items: Array<{ name: string; symbol: string }>;
  onSelect: (symbol: string) => void;
}

const EmojiGrid = ({ items, onSelect }: EmojiGridProps) => {
  const renderItem = (item: { name: string; symbol: string }) => {
    // Check if the symbol is a URL (custom emote)
    const isCustomEmote = item.symbol.startsWith('http');

    if (isCustomEmote) {
      return (
        <img 
          src={item.symbol}
          alt={item.name}
          className="w-6 h-6 object-contain"
          loading="lazy"
        />
      );
    }

    return item.symbol;
  };

  const handleSelect = (item: { name: string; symbol: string }) => {
    // If it's a custom emote, pass the name instead of the URL
    const isCustomEmote = item.symbol.startsWith('http');
    onSelect(isCustomEmote ? item.name : item.symbol);
  };

  return (
    <div className="grid grid-cols-8 gap-1 min-h-[300px] overflow-y-auto">
      {items.map((item) => (
        <Button
          key={item.name}
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-white/10 flex items-center justify-center"
          onClick={() => handleSelect(item)}
          title={item.name}
        >
          {renderItem(item)}
        </Button>
      ))}
    </div>
  );
};

export default EmojiGrid;