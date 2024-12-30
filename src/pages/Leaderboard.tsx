import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GiftStats } from "@/integrations/supabase/types/tables/gifts";
import { Crown } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const Leaderboard = () => {
  const [searchParams] = useSearchParams();
  const limit = parseInt(searchParams.get('limit') || '10');

  const { data: giftStats, isLoading } = useQuery({
    queryKey: ['giftStats', limit],
    queryFn: async () => {
      console.log('[Leaderboard] Fetching top gifters with limit:', limit);
      const { data, error } = await supabase
        .from('gift_stats')
        .select('*')
        .order('total_gifts', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[Leaderboard] Error fetching gift stats:', error);
        throw error;
      }
      console.log('[Leaderboard] Fetched gift stats:', data);
      return data as GiftStats[];
    },
    staleTime: 1000, // Reduce stale time to refresh more frequently
    gcTime: 5000, // Changed from cacheTime to gcTime for v5 compatibility
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-4 bg-[#1A1F2C]">
          <Skeleton className="h-16" />
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="p-4 bg-[#1A1F2C] border-0">
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            <h1 className="text-2xl font-bold text-white">Top Gifters</h1>
          </div>
          <p className="text-[#8A898C]">The most generous members of our community</p>
        </div>

        {!giftStats?.length ? (
          <div className="text-center py-8">
            <p className="text-[#8A898C]">No gift statistics available yet</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {giftStats.map((stat, index) => (
              <Card key={stat.id} className="p-4 bg-black/20 border-0">
                <div className="flex items-center justify-between">
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
                  <div className="text-right">
                    <p className="text-sm text-[#8A898C]">
                      This Month: {(stat.monthly_gifts as Record<string, number>)[getCurrentMonthKey()] || 0}
                    </p>
                    <p className="text-sm text-[#8A898C]">
                      This Year: {(stat.yearly_gifts as Record<string, number>)[getCurrentYear()] || 0}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getCurrentYear = () => {
  return new Date().getFullYear().toString();
};

export default Leaderboard;