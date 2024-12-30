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
      }, 3000); // Reduced from 5000ms to 3000ms

      return () => clearTimeout(scoreboardTimer);
    }
  }, [showingScoreboard, onComplete, completedRef]);
};