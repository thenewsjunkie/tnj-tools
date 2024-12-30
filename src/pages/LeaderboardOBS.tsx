import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LeaderboardOBS = () => {
  const navigate = useNavigate();
  
  const { data: giftStats } = useQuery({
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

  if (!giftStats?.length) {
    return null;
  }

  return (
    <div className="p-0 text-white">
      <div className="space-y-2">
        {giftStats.map((stat, index) => (
          <div 
            key={stat.id} 
            className="flex items-center gap-4 bg-black/50"
          >
            <div className="text-2xl font-bold text-yellow-500 w-8">
              #{index + 1}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{stat.username}</h3>
              <p className="text-sm text-white/80">
                Total Gifts: {stat.total_gifts}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardOBS;