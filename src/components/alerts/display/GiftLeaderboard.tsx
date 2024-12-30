interface GiftLeaderboardProps {
  limit?: number;
  fadeBelow?: number;
}

export const GiftLeaderboard = ({ limit = 5, fadeBelow = 5 }: GiftLeaderboardProps) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col">
      <iframe 
        src={`/leaderboard?limit=${limit}&fadeBelow=${fadeBelow}`}
        className="w-full flex-1 border-none"
        title="Gift Leaderboard"
      />
    </div>
  );
};