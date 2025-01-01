import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeaderboardCard } from "@/components/leaderboard/LeaderboardCard";
import { useLeaderboardVisibility } from "@/hooks/useLeaderboardVisibility";

const LeaderboardOBS = () => {
  useLeaderboardVisibility();

  const { data: giftStats } = useQuery({
    queryKey: ['giftStats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gift_stats')
        .select('*')
        .eq('is_test_data', false)  // Only fetch non-test data
        .order('total_gifts', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  return <LeaderboardCard stats={giftStats || []} />;
};

export default LeaderboardOBS;