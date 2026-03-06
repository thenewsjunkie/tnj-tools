import { useRef, useEffect, useState, useCallback } from "react";
import { useSecretShowsGifters, SecretShowsGifter } from "@/hooks/useSecretShowsGifters";
import { supabase } from "@/integrations/supabase/client";
import { Gift } from "lucide-react";
import secretShowsLogo from "@/assets/secret-shows-logo.png";
import confetti from "canvas-confetti";

const rankStyles = [
  "text-yellow-400 drop-shadow-[0_0_12px_rgba(255,215,0,0.8)]",
  "text-gray-300 drop-shadow-[0_0_8px_rgba(192,192,192,0.6)]",
  "text-amber-600 drop-shadow-[0_0_8px_rgba(205,127,50,0.6)]",
];

const SecretShowsLeaderboard = ({ limit = 20, showGiftCTA = false }: { limit?: number; showGiftCTA?: boolean }) => {
  const { data: gifters = [], isLoading } = useSecretShowsGifters(limit);
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [updatedIds, setUpdatedIds] = useState<Set<string>>(new Set());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [rankChangedIds, setRankChangedIds] = useState<Set<string>>(new Set());

  // Track previous gifters for rank-change CSS animations only
  const prevGiftersRef = useRef<SecretShowsGifter[]>([]);
  const initialLoadDone = useRef(false);

  const fireConfetti = useCallback((yFraction: number) => {
    const y = Math.min(Math.max(yFraction, 0.1), 0.9);
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { x: 0.5, y },
      colors: ["#FFD700", "#FFA500", "#FF6347", "#FFFF00", "#FFE4B5"],
      startVelocity: 30,
      gravity: 0.8,
      ticks: 120,
      scalar: 1.2,
    });
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { x: Math.random() * 0.4 + 0.3, y },
        colors: ["#FFD700", "#4CDBC4", "#FF69B4", "#00CED1"],
        startVelocity: 20,
        gravity: 1,
        ticks: 80,
      });
    }, 200);
  }, []);

  // Direct Supabase realtime subscription for confetti (not dependent on React Query)
  useEffect(() => {
    const channel = supabase
      .channel("leaderboard-confetti-trigger")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "secret_shows_gifters" },
        (payload) => {
          let burstCount = 0;

          if (payload.eventType === "INSERT") {
            const newRow = payload.new as any;
            burstCount = Math.min(newRow.total_gifts || 1, 50);
            setNewIds(new Set([newRow.id]));
          } else if (payload.eventType === "UPDATE") {
            const newRow = payload.new as any;
            const oldRow = payload.old as any;
            const delta = (newRow.total_gifts || 0) - (oldRow.total_gifts || 0);
            if (delta > 0) {
              burstCount = Math.min(delta, 50);
              setUpdatedIds(new Set([newRow.id]));
            }
          }

          if (burstCount > 0) {
            for (let b = 0; b < burstCount; b++) {
              setTimeout(() => fireConfetti(0.4), b * 100);
            }
            // Clear animation classes after they play
            setTimeout(() => {
              setUpdatedIds(new Set());
              setNewIds(new Set());
            }, 2000);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fireConfetti]);

  // Track rank changes for CSS animations (no confetti)
  useEffect(() => {
    if (!initialLoadDone.current) {
      if (gifters.length > 0) {
        initialLoadDone.current = true;
        prevGiftersRef.current = gifters;
      }
      return;
    }

    const prev = prevGiftersRef.current;
    const prevMap = new Map(prev.map((g, i) => [g.id, i]));
    const newRankChanged = new Set<string>();

    gifters.forEach((gifter, i) => {
      const prevIndex = prevMap.get(gifter.id);
      if (prevIndex !== undefined && prevIndex !== i) {
        newRankChanged.add(gifter.id);
      }
    });

    if (newRankChanged.size > 0) {
      setRankChangedIds(newRankChanged);
      setTimeout(() => setRankChangedIds(new Set()), 2000);
    }

    prevGiftersRef.current = gifters;
  }, [gifters]);

  return (
    <div className="secret-shows-leaderboard h-screen flex flex-col bg-transparent px-2 sm:px-4 py-4 sm:py-8 overflow-hidden">
      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 min-h-0">
        {/* Logo */}
        <div className="flex justify-center mb-2 sm:mb-4">
          <img src={secretShowsLogo} alt="Secret Shows" className="h-14 sm:h-24 w-auto drop-shadow-[0_0_20px_rgba(255,215,0,0.2)]" />
        </div>

        <h1 className="text-center text-base sm:text-2xl font-bold text-amber-400 mb-1 tracking-wide">
          Secret Shows Gifts
        </h1>

        {isLoading ? (
          <p className="text-gray-500 text-center py-12">Loading leaderboard...</p>
        ) : gifters.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No gifters yet. Be the first!</p>
        ) : (
          <div className="flex-1 flex flex-col gap-1.5 sm:gap-2 min-h-0">
            {gifters.map((gifter, i) => {
              const monthlyCount = (gifter.monthly_gifts as Record<string, number>)?.[currentMonth] || 0;
              const isUpdated = updatedIds.has(gifter.id);
              const isNew = newIds.has(gifter.id);
              const isRankChanged = rankChangedIds.has(gifter.id);

              return (
              <div
                  key={gifter.id}
                  className={`
                    leaderboard-row flex-1 flex items-center gap-2 sm:gap-4 px-2 sm:px-4 rounded-lg min-h-0
                    transition-all duration-500 ease-out
                    ${i < 3
                      ? "bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20"
                      : "bg-white/[0.03] border border-white/[0.05]"
                    }
                    ${isNew ? "animate-leaderboard-new" : ""}
                    ${isUpdated ? "animate-leaderboard-pulse" : ""}
                    ${isRankChanged && !isNew ? "animate-leaderboard-shift" : ""}
                  `}
                  style={{
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {/* Rank */}
                  <span className={`leaderboard-rank text-lg sm:text-2xl font-black w-6 sm:w-8 text-center transition-all duration-300 ${
                    rankStyles[i] || "text-gray-500"
                  } ${isRankChanged ? "scale-125" : ""}`}>
                    {i + 1}
                  </span>

                  {/* Username */}
                  <span className={`leaderboard-username flex-1 font-semibold truncate text-sm sm:text-base transition-all duration-300 ${
                    i < 3 ? "text-white" : "text-gray-300"
                  } ${isNew ? "text-amber-300" : ""}`}>
                    {gifter.username}
                  </span>

                  {/* Monthly - hidden on very narrow */}
                  {monthlyCount > 0 && (
                    <span className="hidden sm:inline text-xs text-amber-500/70 bg-amber-500/10 px-2 py-0.5 rounded">
                      +{monthlyCount} this month
                    </span>
                  )}

                  {/* Total with flash effect */}
                  <span className={`leaderboard-score font-mono font-bold text-base sm:text-lg transition-all duration-300 ${
                    i < 3 ? "text-amber-400" : "text-amber-500/80"
                  } ${isUpdated ? "scale-150 text-yellow-300 drop-shadow-[0_0_16px_rgba(255,215,0,1)]" : ""}`}>
                    {gifter.total_gifts}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Gift CTA - OBS only */}
        {showGiftCTA && (
          <div className="flex flex-col items-center gap-2 mt-4 sm:mt-6">
            <Gift className="h-10 w-10 sm:h-12 sm:w-12 text-amber-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
            <p className="text-amber-300/90 text-base sm:text-lg font-semibold tracking-wide">
              Gift Now @ thenewsjunkie.com
            </p>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes leaderboard-new {
          0% {
            opacity: 0;
            transform: translateX(-100%) scale(0.5);
            filter: brightness(3);
          }
          30% {
            opacity: 1;
            transform: translateX(5%) scale(1.05);
            filter: brightness(2);
          }
          50% {
            transform: translateX(-2%) scale(1.02);
          }
          70% {
            transform: translateX(1%) scale(1.01);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
            filter: brightness(1);
          }
        }

        @keyframes leaderboard-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
            background-color: transparent;
          }
          15% {
            box-shadow: 0 0 30px 10px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.2);
            background-color: rgba(255, 215, 0, 0.15);
            transform: scale(1.03);
          }
          30% {
            box-shadow: 0 0 50px 15px rgba(255, 165, 0, 0.4), inset 0 0 30px rgba(255, 165, 0, 0.15);
            background-color: rgba(255, 165, 0, 0.1);
            transform: scale(1.01);
          }
          50% {
            box-shadow: 0 0 25px 5px rgba(255, 215, 0, 0.3);
            transform: scale(1.02);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
            background-color: transparent;
            transform: scale(1);
          }
        }

        @keyframes leaderboard-shift {
          0% {
            transform: translateY(0);
          }
          25% {
            transform: translateY(-8px);
            box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
          }
          50% {
            transform: translateY(3px);
          }
          75% {
            transform: translateY(-2px);
          }
          100% {
            transform: translateY(0);
          }
        }

        .animate-leaderboard-new {
          animation: leaderboard-new 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-leaderboard-pulse {
          animation: leaderboard-pulse 1.5s ease-out forwards;
        }

        .animate-leaderboard-shift {
          animation: leaderboard-shift 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SecretShowsLeaderboard;
