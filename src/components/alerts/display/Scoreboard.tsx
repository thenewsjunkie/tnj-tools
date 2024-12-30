import React from "react";

interface ScoreboardProps {
  limit?: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ limit = 8 }) => {
  console.log('[Scoreboard] Rendering with limit:', limit);
  
  return (
    <div className="fixed inset-0 z-50 bg-black/80">
      <iframe 
        src={`${window.location.origin}/leaderboard?limit=${limit}`}
        className="w-full h-screen border-none"
        title="Leaderboard"
        style={{ pointerEvents: 'none' }}
      />
      <div className="fixed bottom-0 left-0 right-0 p-4 text-center text-white text-2xl">
        Gift Secret Shows Access To Other Fans On TheNewsJunkie.com Now! 1 Gift = 1 Magnet!
      </div>
    </div>
  );
};