import { Eye } from "lucide-react";

interface ReviewStreamControlProps {
  isActive: boolean;
  onToggle: (e: React.MouseEvent) => void;
}

const ReviewStreamControl = ({ isActive, onToggle }: ReviewStreamControlProps) => {
  return (
    <button
      onClick={onToggle}
      className="p-1 rounded-full hover:bg-background/50 transition-colors"
    >
      <Eye 
        className={`h-4 w-4 ${isActive ? 'text-neon-red' : 'text-foreground'}`} 
      />
    </button>
  );
};

export default ReviewStreamControl;