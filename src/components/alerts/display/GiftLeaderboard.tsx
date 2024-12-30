interface GiftLeaderboardProps {
  limit?: number;
  fadeBelow?: number;
}

export const GiftLeaderboard = ({ limit = 5, fadeBelow = 5 }: GiftLeaderboardProps) => {
  console.log('[GiftLeaderboard] Rendering with props:', { limit, fadeBelow });
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80">
      <iframe 
        src={`/leaderboard?limit=${limit}&fadeBelow=${fadeBelow}&hideText=true`}
        className="w-full h-full border-none"
        title="Gift Leaderboard"
      />
    </div>
  );
};