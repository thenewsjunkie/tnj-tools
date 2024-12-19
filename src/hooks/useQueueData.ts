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
    refetchInterval: 3000, // Reduce polling frequency
    refetchIntervalInBackground: false,
    staleTime: 2000,
    gcTime: 5000, // Add garbage collection time
  });

  return { queueData, refetch };
};