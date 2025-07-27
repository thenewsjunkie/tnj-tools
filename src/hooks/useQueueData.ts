import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeConnection } from "./useRealtimeConnection";

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
    // Always poll every 2 seconds for consistent updates
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
    staleTime: 1000,
    gcTime: 60000,
  });

  // Subscribe to real-time alert queue changes
  useRealtimeConnection(
    'alert-queue-changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'alert_queue',
    },
    (payload) => {
      console.log('[useQueueData] Alert queue updated:', payload);
      // Force refetch when alerts are updated (especially when completed)
      refetch();
    }
  );

  return { queueData, refetch };
};