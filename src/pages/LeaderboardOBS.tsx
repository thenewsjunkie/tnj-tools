import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeaderboardCard } from "@/components/leaderboard/LeaderboardCard";
import { useLeaderboardVisibility } from "@/hooks/useLeaderboardVisibility";
import { GiftStats } from "@/integrations/supabase/types/tables/gifts";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const LeaderboardOBS = () => {
  const isVisible = useLeaderboardVisibility();
  const queryClient = useQueryClient();

  const { data: giftStats, isLoading } = useQuery({
    queryKey: ['giftStats', false],  // false for includeTestData
    queryFn: async () => {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      console.log('[LeaderboardOBS] Fetching stats for month:', currentMonthKey);
      
      const { data, error } = await supabase
        .from('gift_stats')
        .select('*')
        .eq('is_test_data', false)
        .not('monthly_gifts', 'eq', '{}');  // Only get users who have gifted

      if (error) {
        console.error('[LeaderboardOBS] Error fetching gift stats:', error);
        throw error;
      }

      // Sort by current month's gifts
      const sortedData = data
        .map(stat => ({
          ...stat,
          current_month_gifts: (stat.monthly_gifts as Record<string, number>)[currentMonthKey] || 0
        }))
        .sort((a, b) => b.current_month_gifts - a.current_month_gifts)
        .slice(0, 5);  // Only get top 5

      console.log('[LeaderboardOBS] Processed stats:', sortedData);
      return sortedData as GiftStats[];
    },
  });

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel('gift-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',  // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'gift_stats'
        },
        () => {
          console.log('[LeaderboardOBS] Received realtime update, invalidating query');
          queryClient.invalidateQueries({ queryKey: ['giftStats', false] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Don't render anything while loading to prevent invalid array operations
  if (isLoading) return null;

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