import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ScoreControlsProps {
  score: number;
  onScoreChange: (increment: boolean) => void;
}

const ScoreControls = ({ score, onScoreChange }: ScoreControlsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScoreChange = (increment: boolean) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    onScoreChange(increment);
    
    // Reset processing state after a short delay
    setTimeout(() => setIsProcessing(false), 500);
  };

  return (
    <div className="flex items-center justify-center space-x-4 bg-black/60 p-4 rounded-lg backdrop-blur-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleScoreChange(true)}
        disabled={isProcessing}
        className="text-white hover:bg-white/10 disabled:opacity-50"
      >
        <ArrowUp className="h-6 w-6" />
      </Button>
      <div className="relative">
        <div className="absolute inset-0 blur-lg bg-neon-red/30 animate-pulse" />
        <div className="relative text-4xl font-['Digital-7'] text-neon-red w-16 text-center animate-led-flicker drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">
          {score}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleScoreChange(false)}
        disabled={isProcessing}
        className="text-white hover:bg-white/10 disabled:opacity-50"
      >
        <ArrowDown className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default ScoreControls;