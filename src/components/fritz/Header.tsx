import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onReset: () => void;
}

const Header = ({ onReset }: HeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-4xl font-['Radiate Sans Extra Bold'] text-black">
        Fritz on the Street
      </h1>
      <Button
        variant="ghost"
        size="icon"
        onClick={onReset}
        className="text-black hover:bg-white/10"
      >
        <RefreshCw className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default Header;