import React from "react";

interface ScoreboardProps {
  limit?: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ limit = 8 }) => {
  console.log('[Scoreboard] Rendering with limit:', limit);
  
  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col">
      <iframe 
        src={`/leaderboard?limit=${limit}`}
        className="w-full h-full border-none"
        title="Leaderboard"
      />
    </div>
  );
};