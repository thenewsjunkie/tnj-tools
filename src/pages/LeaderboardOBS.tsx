import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LeaderboardOBS = () => {
  const [isVisible, setIsVisible] = useState(true);
  
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

  // Handle POST requests to show the leaderboard
  useEffect(() => {
    const handleVisibilityRequest = async (event: MessageEvent) => {
      if (event.data === 'show-leaderboard') {
        console.log('[LeaderboardOBS] Received show request');
        setIsVisible(true);
        // Auto-hide after 8 seconds
        setTimeout(() => {
          console.log('[LeaderboardOBS] Auto-hiding leaderboard');
          setIsVisible(false);
        }, 8000);
      }
    };

    window.addEventListener('message', handleVisibilityRequest);
    return () => window.removeEventListener('message', handleVisibilityRequest);
  }, []);

  if (isLoading) {
    return (
      <div className="p-4">
        <Card className="p-4 bg-[#1A1F2C]">
          <Skeleton className="h-16" />
        </Card>
      </div>
    );
  }

  if (!giftStats?.length || !isVisible) {
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
    </div>
  );
};

export default LeaderboardOBS;