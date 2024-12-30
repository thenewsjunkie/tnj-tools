import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LeaderboardVisibilityValue } from "@/integrations/supabase/types/tables/system";

const LeaderboardOBS = () => {
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
      return (data?.value as LeaderboardVisibilityValue)?.isVisible ?? false;
    },
  });

  useEffect(() => {
    const handleVisibilityRequest = async () => {
      console.log('[LeaderboardOBS] Received show request');
      
      // Update visibility in database
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'leaderboard_visibility',
          value: { isVisible: true } as LeaderboardVisibilityValue,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('[LeaderboardOBS] Error updating visibility:', error);
        return;
      }

      // Auto-hide after 8 seconds
      setTimeout(async () => {
        console.log('[LeaderboardOBS] Auto-hiding leaderboard');
        const { error: hideError } = await supabase
          .from('system_settings')
          .upsert({
            key: 'leaderboard_visibility',
            value: { isVisible: false } as LeaderboardVisibilityValue,
            updated_at: new Date().toISOString()
          });

        if (hideError) {
          console.error('[LeaderboardOBS] Error hiding leaderboard:', hideError);
        }
      }, 8000);
    };

    // Handle POST requests using a custom event
    const handlePostRequest = async () => {
      handleVisibilityRequest();
    };

    // Create a route handler for POST requests
    const originalFetchFunction = window.fetch;
    if (typeof window !== 'undefined') {
      window.fetch = async function(input, init) {
        if (input === '/leaderboard/obs' && init?.method === 'POST') {
          handlePostRequest();
          return new Response(null, { status: 200 });
        }
        return originalFetchFunction.apply(this, [input, init]);
      };
    }

    // Also listen for message events
    window.addEventListener('message', (event) => {
      if (event.data === 'show-leaderboard') {
        handleVisibilityRequest();
      }
    });

    // Set up realtime subscription
    const channel = supabase.channel('leaderboard-visibility')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'system_settings',
          filter: 'key=eq.leaderboard_visibility'
        },
        (payload) => {
          console.log('[LeaderboardOBS] Received visibility update:', payload);
        }
      )
      .subscribe((status) => {
        console.log('[LeaderboardOBS] Subscription status:', status);
      });

    return () => {
      // Restore original fetch
      if (typeof window !== 'undefined') {
        window.fetch = originalFetchFunction;
      }
      // Clean up subscription
      supabase.removeChannel(channel);
    };
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

  if (!giftStats?.length || !visibility) {
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