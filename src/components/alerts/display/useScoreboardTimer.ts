import { useEffect } from "react";

interface UseScoreboardTimerProps {
  showingScoreboard: boolean;
  onComplete: () => void;
  completedRef: React.MutableRefObject<boolean>;
}

export const useScoreboardTimer = ({ showingScoreboard, onComplete, completedRef }: UseScoreboardTimerProps) => {
  useEffect(() => {
    if (showingScoreboard) {
      console.log('[ScoreboardTimer] Starting scoreboard display timer');
      const scoreboardTimer = setTimeout(() => {
        console.log('[ScoreboardTimer] Scoreboard display complete');
        completedRef.current = true;
        onComplete();
      }, 5000);

      return () => clearTimeout(scoreboardTimer);
    }
  }, [showingScoreboard, onComplete, completedRef]);
};