import React from "react";

interface ScoreboardProps {
  limit?: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ limit = 8 }) => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <iframe 
        src={`/leaderboard?limit=${limit}`}
        className="w-full flex-1 border-none"
        title="Leaderboard"
      />
      <div className="p-4 text-center text-white text-4xl font-bold alert-message-font">
        Gift Secret Shows Access To Other Fans On TheNewsJunkie.com Now! 1 Gift = 1 Magnet!
      </div>
    </div>
  );
};