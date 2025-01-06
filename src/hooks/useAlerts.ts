import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Alert {
  id: string;
  title: string;
  media_url: string;
  media_type: string;
  message_text?: string | null;
  message_enabled?: boolean | null;
  font_size?: number | null;
  is_gift_alert?: boolean | null;
  gift_count_animation_speed?: number | null;
  gift_text_color?: string | null;
  gift_count_color?: string | null;
  is_message_alert?: boolean | null;  // Added this property
}

export const useAlerts = () => {
  const { data: alerts, refetch } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      console.log('Fetching alerts...');
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching alerts:', error);
        throw error;
      }
      console.log('Fetched alerts:', data);
      return data;
    }
  });

  return { alerts, refetch };
};