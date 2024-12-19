import { Input } from "@/components/ui/input";

interface EmojiSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const EmojiSearch = ({ value, onChange }: EmojiSearchProps) => {
  return (
    <Input
      placeholder="Search..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mb-2 bg-white/5 border-white/10 text-white placeholder:text-white/50"
    />
  );
};

export default EmojiSearch;