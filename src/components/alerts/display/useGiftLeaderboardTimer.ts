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
      }, 3000); // Reduced to 3 seconds since we're now properly waiting for the count

      return () => clearTimeout(leaderboardTimer);
    }
  }, [showingLeaderboard, onComplete, completedRef]);
};