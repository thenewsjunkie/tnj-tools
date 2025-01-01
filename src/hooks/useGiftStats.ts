import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GiftStats } from "@/integrations/supabase/types/tables/gifts";

export const useGiftStats = (includeTestData: boolean) => {
  return useQuery({
    queryKey: ["gift-stats", includeTestData],
    queryFn: async () => {
      let query = supabase
        .from("gift_stats")
        .select("*");
      
      if (!includeTestData) {
        query = query.eq('is_test_data', false);
      }
      
      // Order by last_gift_date in descending order (most recent first)
      // Null values will automatically be placed last
      const { data, error } = await query
        .order('last_gift_date', { ascending: false });

      if (error) throw error;
      return data as GiftStats[];
    },
  });
};