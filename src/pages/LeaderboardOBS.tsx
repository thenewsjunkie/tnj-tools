import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LeaderboardOBS = () => {
  const navigate = useNavigate();
  
  const { data: giftStats, isLoading } = useQuery({
    queryKey: ['giftStats'],
    queryFn: async () => {
      console.log('[LeaderboardOBS] Fetching top gifters');
      const { data, error } = await supabase
        .from('gift_stats')
        .select('*')
        .order('total_gifts', { ascending: false })
        .limit(5);

      if (error) {
        console.error('[LeaderboardOBS] Error fetching gift stats:', error);
        throw error;
      }
      console.log('[LeaderboardOBS] Fetched gift stats:', data);
      return data;
    },
  });

  // Auto-hide after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('[LeaderboardOBS] Auto-hiding leaderboard');
      navigate('/');
    }, 8000);

    return () => clearTimeout(timer);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="p-4">
        <Card className="p-4 bg-[#1A1F2C]">
          <Skeleton className="h-16" />
        </Card>
      </div>
    );
  }

  if (!giftStats?.length) {
    return null;
  }

  return (
    <div className="p-0">
      <Card className="p-4 bg-[#1A1F2C]/90 border-0">
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            <h1 className="text-2xl font-bold text-white">Top Gifters</h1>
          </div>
          <p className="text-[#8A898C]">The most generous members of our community</p>
        </div>

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

export default LeaderboardOBS;