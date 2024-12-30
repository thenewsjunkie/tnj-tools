import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GiftLeaderboard } from "@/components/alerts/display/GiftLeaderboard";

const LeaderboardOBS = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // Show leaderboard when triggered via URL
    const show = searchParams.get('show') === 'true';
    if (show) {
      setIsVisible(true);
      // Hide after 8 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <GiftLeaderboard limit={5} fadeBelow={5} />
    </div>
  );
};

export default LeaderboardOBS;