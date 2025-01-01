import { Card } from "@/components/ui/card";
import { Crown } from "lucide-react";
import type { GiftStats } from "@/integrations/supabase/types/tables/gifts";

interface LeaderboardCardProps {
  stats: GiftStats[];
}

export const LeaderboardCard = ({ stats }: LeaderboardCardProps) => {
  if (!stats?.length) {
    return null;
  }

  return (
    <Card className="p-4 bg-[#1A1F2C]/90 border-0">
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl font-bold text-white">Top Gifters</h1>
        </div>
        <p className="text-[#8A898C]">The most generous members of our community</p>
      </div>

      <div className="grid gap-2">
        {stats.map((stat, index) => (
          <Card key={stat.id} className="p-4 bg-black/20 border-0">
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
          </Card>
        ))}
      </div>
    </Card>
  );
};