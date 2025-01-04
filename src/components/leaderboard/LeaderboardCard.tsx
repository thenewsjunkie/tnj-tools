import { Card } from "@/components/ui/card";
import { Crown } from "lucide-react";
import type { GiftStats } from "@/integrations/supabase/types/tables/gifts";

interface LeaderboardCardProps {
  stats: GiftStats[];
}

export const LeaderboardCard = ({ stats }: LeaderboardCardProps) => {
  // Ensure stats is an array and has a valid length
  const safeStats = Array.isArray(stats) ? stats : [];
  
  // Create an array of exactly 5 items, filling empty slots with null
  const filledStats = [...safeStats.slice(0, 5), ...Array(Math.max(0, 5 - safeStats.length)).fill(null)];

  return (
    <Card className="p-4 bg-[#1A1F2C]/90 border-0 h-[540px] flex flex-col">
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl font-bold text-white">Top Gifters</h1>
        </div>
        <p className="text-[#8A898C]">The most generous members of our community</p>
      </div>

      <div className="grid gap-2 flex-1">
        {filledStats.map((stat, index) => (
          <Card 
            key={stat?.id || `empty-${index}`} 
            className={`p-4 ${stat ? 'bg-black/20' : 'bg-transparent'} border-0`}
          >
            {stat ? (
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-yellow-500 w-8">
                  #{index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{stat.username}</h3>
                  <p className="text-sm text-[#8A898C]">
                    Total Gifts: {stat.total_gifts}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 opacity-0">
                <div className="text-2xl font-bold text-yellow-500 w-8">
                  #{index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Placeholder</h3>
                  <p className="text-sm text-[#8A898C]">
                    Total Gifts: 0
                  </p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </Card>
  );
};