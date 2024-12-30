import React from "react";

interface ScoreboardProps {
  limit?: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ limit = 5 }) => {
  return (
    <div className="fixed inset-0 bg-black">
      <iframe 
        src={`/leaderboard?limit=${limit}`}
        className="w-full h-full border-none"
        title="Leaderboard"
      />
    </div>
  );
};