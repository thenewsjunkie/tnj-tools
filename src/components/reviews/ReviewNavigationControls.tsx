import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewNavigationControlsProps {
  onNavigate: (direction: 'prev' | 'next') => void;
}

const ReviewNavigationControls = ({ onNavigate }: ReviewNavigationControlsProps) => {
  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate('prev');
        }}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate('next');
        }}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </>
  );
};

export default ReviewNavigationControls;