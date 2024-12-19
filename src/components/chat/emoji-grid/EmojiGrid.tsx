import { Button } from "@/components/ui/button";

interface EmojiGridProps {
  items: Array<{ name: string; symbol: string }>;
  onSelect: (symbol: string) => void;
}

const EmojiGrid = ({ items, onSelect }: EmojiGridProps) => {
  return (
    <div className="grid grid-cols-8 gap-1 min-h-[300px] overflow-y-auto">
      {items.map((item) => (
        <Button
          key={item.name}
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-white/10"
          onClick={() => onSelect(item.symbol)}
        >
          {item.symbol}
        </Button>
      ))}
    </div>
  );
};

export default EmojiGrid;