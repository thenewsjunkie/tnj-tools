import { useEffect } from "react";

interface UseGiftLeaderboardTimerProps {
  showingLeaderboard: boolean;
  onComplete: () => void;
  completedRef: React.MutableRefObject<boolean>;
}

export const useGiftLeaderboardTimer = ({ 
  showingLeaderboard, 
  onComplete, 
  completedRef 
}: UseGiftLeaderboardTimerProps) => {
  useEffect(() => {
    if (showingLeaderboard) {
      console.log('[GiftLeaderboardTimer] Starting leaderboard display timer');
      const leaderboardTimer = setTimeout(() => {
        console.log('[GiftLeaderboardTimer] Leaderboard display complete');
        completedRef.current = true;
        onComplete();
      }, 10000); // Increased from 3000 to 10000 (10 seconds)

      return () => clearTimeout(leaderboardTimer);
    }
  }, [showingLeaderboard, onComplete, completedRef]);
};