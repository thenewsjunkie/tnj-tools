import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeConnection } from "./useRealtimeConnection";
import { queryClient } from "@/lib/react-query";

export const useQueueData = () => {
  const { data: queueData, refetch } = useQuery({
    queryKey: ['alert_queue'],
    queryFn: async () => {
      console.log('[useQueueData] Fetching queue...');
      const { data, error } = await supabase
        .from('alert_queue')
        .select(`
          *,
          alert:alerts(
            id,
            title,
            media_url,
            media_type,
            message_text,
            message_enabled,
            font_size,
            is_gift_alert,
            gift_count_animation_speed,
            gift_text_color,
            gift_count_color,
            display_duration,
            repeat_count,
            repeat_delay
          )
        `)
        .in('status', ['pending', 'playing'])
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('[useQueueData] Error fetching queue:', error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log('[useQueueData] Raw alert data from database:', {
          alert: data[0].alert,
          repeat_count: data[0].alert.repeat_count,
          repeat_delay: data[0].alert.repeat_delay
        });
      }

      console.log('[useQueueData] Queue data fetched:', data);
      return data || [];
    },
    // Disable background polling when real-time is active
    refetchInterval: false,
    refetchIntervalInBackground: false,
    staleTime: 0, // Prevent stale data display
    gcTime: 60000,
  });

  // Subscribe to real-time alert queue changes with targeted invalidation
  useRealtimeConnection(
    'alert-queue-changes',
    {
      event: 'UPDATE', 
      schema: 'public',
      table: 'alert_queue',
    },
    (payload) => {
      console.log('[useQueueData] Alert queue updated:', payload);
      
      const oldStatus = payload.old?.status;
      const newStatus = payload.new?.status;
      
      // Only invalidate cache for status changes that affect our query results
      // Our query filters for 'pending' and 'playing' statuses
      const shouldInvalidate = 
        (oldStatus === 'playing' && newStatus === 'completed') || // Alert completed
        (oldStatus === 'pending' && newStatus === 'playing') ||   // Alert started
        (oldStatus === 'completed' && newStatus === 'pending') || // Alert reset
        (newStatus === 'pending' || newStatus === 'playing');     // New alerts in our filter
      
      if (shouldInvalidate) {
        console.log('[useQueueData] Status change affects query, clearing cache:', {
          oldStatus,
          newStatus,
          alertId: payload.new?.id
        });
        
        // Clear cache immediately to prevent stale data
        queryClient.removeQueries({ queryKey: ['alert_queue'] });
        
        // Wait a brief moment for the server to process, then refetch
        setTimeout(() => {
          console.log('[useQueueData] Refetching after cache clear');
          refetch();
        }, 100);
      } else {
        console.log('[useQueueData] Status change does not affect query, skipping invalidation:', {
          oldStatus,
          newStatus
        });
      }
    }
  );

  return { queueData, refetch };
};