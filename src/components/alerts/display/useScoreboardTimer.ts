import { useEffect } from "react";

interface UseScoreboardTimerProps {
  showingScoreboard: boolean;
  onComplete: () => void;
  completedRef: React.MutableRefObject<boolean>;
}

export const useScoreboardTimer = ({ showingScoreboard, onComplete, completedRef }: UseScoreboardTimerProps) => {
  useEffect(() => {
    if (showingScoreboard) {
      console.log('[GiftLeaderboardTimer] Starting leaderboard display timer');
      const scoreboardTimer = setTimeout(() => {
        console.log('[GiftLeaderboardTimer] Leaderboard display complete');
        completedRef.current = true;
        onComplete();
      }, 3000);

      return () => clearTimeout(scoreboardTimer);
    }
  }, [showingScoreboard, onComplete, completedRef]);
};