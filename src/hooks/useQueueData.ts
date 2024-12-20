import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useQueueData = () => {
  const { data: queueData, refetch } = useQuery({
    queryKey: ['alert_queue'],
    queryFn: async () => {
      console.log('[useQueueData] Fetching queue...');
      const { data, error } = await supabase
        .from('alert_queue')
        .select(`
          *,
          alert:alerts(*)
        `)
        .in('status', ['pending', 'playing'])
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('[useQueueData] Error fetching queue:', error);
        throw error;
      }
      console.log('[useQueueData] Queue data fetched:', data);
      return data || [];
    },
    // Reduced from 10 seconds to 2 seconds for more responsive updates
    refetchInterval: 2000,
    // Enable background refetching for more responsive updates
    refetchIntervalInBackground: true,
    // Reduced stale time to refresh data more frequently
    staleTime: 1000,
    // Keep unused data in cache for longer to prevent unnecessary refetches
    gcTime: 60000,
  });

  return { queueData, refetch };
};
