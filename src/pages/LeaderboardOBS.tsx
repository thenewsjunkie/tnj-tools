import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeaderboardCard } from "@/components/leaderboard/LeaderboardCard";
import { useLeaderboardVisibility } from "@/hooks/useLeaderboardVisibility";
import { GiftStats } from "@/integrations/supabase/types/tables/gifts";
import { cn } from "@/lib/utils";

const LeaderboardOBS = () => {
  const isVisible = useLeaderboardVisibility();

  const { data: giftStats } = useQuery({
    queryKey: ['giftStats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gift_stats')
        .select('*')
        .eq('is_test_data', false)  // Only fetch non-test data
        .order('total_gifts', { ascending: false })
        .limit(5);  // Only get top 5

      if (error) throw error;
      return data as GiftStats[];
    },
  });

  return (
    <div className={cn(
      "transition-all duration-500 ease-in-out transform",
      isVisible 
        ? "opacity-100 translate-y-0" 
        : "opacity-0 translate-y-full"
    )}>
      <LeaderboardCard stats={giftStats || []} />
    </div>
  );
};

export default LeaderboardOBS;