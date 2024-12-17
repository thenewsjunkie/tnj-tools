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
      return data;
    },
    // Increase refetch interval to reduce unnecessary fetches
    refetchInterval: 2000,
    // Don't refetch in the background when window is not focused
    refetchIntervalInBackground: false,
    // Add stale time to prevent unnecessary refetches
    staleTime: 1000,
  });

  return { queueData, refetch };
};