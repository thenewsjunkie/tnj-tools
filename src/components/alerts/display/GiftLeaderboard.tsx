import React from "react";

interface GiftLeaderboardProps {
  limit?: number;
}

export const GiftLeaderboard = ({ limit = 5 }: GiftLeaderboardProps) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col">
      <iframe 
        src={`/leaderboard?limit=${limit}&fadeBelow=5`}
        className="w-full flex-1 border-none"
        title="Gift Leaderboard"
      />
      <div className="p-4 pb-8 text-center text-white text-4xl font-bold alert-message-font">
        Gift Secret Shows Access To Other Fans On TheNewsJunkie.com Now! 1 Gift = 1 Magnet!
      </div>
    </div>
  );
};