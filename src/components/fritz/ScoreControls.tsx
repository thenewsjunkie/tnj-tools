import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScoreControlsProps {
  score: number;
  onScoreChange: (increment: boolean) => void;
}

const ScoreControls = ({ score, onScoreChange }: ScoreControlsProps) => {
  return (
    <div className="flex items-center space-x-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onScoreChange(true)}
        className="text-black hover:bg-white/10"
      >
        <ArrowUp className="h-6 w-6" />
      </Button>
      <div className="text-4xl font-['Digital-7'] text-neon-red w-16 text-center">
        {score}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onScoreChange(false)}
        className="text-black hover:bg-white/10"
      >
        <ArrowDown className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default ScoreControls;