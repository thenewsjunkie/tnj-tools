import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClearButtonProps {
  onClick: () => void;
}

const ClearButton = ({ onClick }: ClearButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="absolute top-2 right-2 text-white/50 hover:text-white hover:bg-white/10"
    >
      <X className="h-4 w-4" />
    </Button>
  );
};

export default ClearButton;