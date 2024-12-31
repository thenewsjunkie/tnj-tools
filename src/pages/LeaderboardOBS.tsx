import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaderboardCard } from "@/components/leaderboard/LeaderboardCard";
import { useLeaderboardVisibility } from "@/hooks/useLeaderboardVisibility";
import type { Json } from "@/integrations/supabase/types/helpers";
import type { GiftStats } from "@/integrations/supabase/types/tables/gifts";

interface LeaderboardVisibilityValue {
  isVisible: boolean;
}

const LeaderboardOBS = () => {
  // Set up visibility handling
  useLeaderboardVisibility();

  // Fetch gift stats
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
      return data as GiftStats[];
    },
  });

  // Check visibility state with realtime updates
  const { data: visibility } = useQuery({
    queryKey: ['leaderboardVisibility'],
    queryFn: async () => {
      console.log('[LeaderboardOBS] Fetching visibility state');
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'leaderboard_visibility')
        .single();

      if (error && error.code !== 'PGNF') {
        console.error('[LeaderboardOBS] Error fetching visibility:', error);
        throw error;
      }
      console.log('[LeaderboardOBS] Fetched visibility state:', data);
      const value = data?.value as { [key: string]: Json };
      return value && typeof value === 'object' && 'isVisible' in value ? 
        (value as unknown as LeaderboardVisibilityValue).isVisible : false;
    },
    refetchInterval: 1000, // Poll every second to ensure we catch visibility changes
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <Skeleton className="h-16" />
      </div>
    );
  }

  if (!giftStats?.length || !visibility) {
    return null;
  }

  return (
    <div className="p-0">
      <LeaderboardCard stats={giftStats} />
    </div>
  );
};

export default LeaderboardOBS;