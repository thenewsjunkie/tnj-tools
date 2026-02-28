import { useSecretShowsGifters } from "@/hooks/useSecretShowsGifters";
import secretShowsLogo from "@/assets/secret-shows-logo.png";

const rankStyles = [
  "text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]",
  "text-gray-300 drop-shadow-[0_0_6px_rgba(192,192,192,0.5)]",
  "text-amber-600 drop-shadow-[0_0_6px_rgba(205,127,50,0.5)]",
];

const SecretShowsLeaderboard = () => {
  const { data: gifters = [], isLoading } = useSecretShowsGifters(20);
  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={secretShowsLogo} alt="Secret Shows" className="h-24 w-auto drop-shadow-[0_0_20px_rgba(255,215,0,0.2)]" />
        </div>

        <h1 className="text-center text-2xl font-bold text-amber-400 mb-1 tracking-wide">
          Subscription Gifter Leaderboard
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          Top supporters who gift Secret Shows subscriptions
        </p>

        {isLoading ? (
          <p className="text-gray-500 text-center py-12">Loading leaderboard...</p>
        ) : gifters.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No gifters yet. Be the first!</p>
        ) : (
          <div className="space-y-2">
            {gifters.map((gifter, i) => {
              const monthlyCount = (gifter.monthly_gifts as Record<string, number>)?.[currentMonth] || 0;
              return (
                <div
                  key={gifter.id}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                    i < 3
                      ? "bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20"
                      : "bg-white/[0.03] border border-white/[0.05]"
                  }`}
                >
                  {/* Rank */}
                  <span className={`text-2xl font-black w-8 text-center ${rankStyles[i] || "text-gray-500"}`}>
                    {i + 1}
                  </span>

                  {/* Username */}
                  <span className={`flex-1 font-semibold truncate ${i < 3 ? "text-white" : "text-gray-300"}`}>
                    {gifter.username}
                  </span>

                  {/* Monthly */}
                  {monthlyCount > 0 && (
                    <span className="text-xs text-amber-500/70 bg-amber-500/10 px-2 py-0.5 rounded">
                      +{monthlyCount} this month
                    </span>
                  )}

                  {/* Total */}
                  <span className={`font-mono font-bold text-lg ${i < 3 ? "text-amber-400" : "text-amber-500/80"}`}>
                    {gifter.total_gifts}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecretShowsLeaderboard;
