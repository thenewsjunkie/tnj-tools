import { supabase } from "@/integrations/supabase/client";
import { queryClient } from "@/lib/react-query";

export const triggerLeaderboard = async () => {
  try {
    console.log('[useLeaderboardActions] Triggering leaderboard');

    // Invalidate the giftStats query to force a refresh
    // Include both query keys to ensure all queries are invalidated
    await queryClient.invalidateQueries({ 
      queryKey: ['giftStats']
    });

    // First check if the record exists
    const { data: existingSettings } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', 'leaderboard_visibility')
      .single();

    if (existingSettings) {
      // Update existing record
      const { error: visibilityError } = await supabase
        .from('system_settings')
        .update({
          value: { isVisible: true },
          updated_at: new Date().toISOString()
        })
        .eq('key', 'leaderboard_visibility');

      if (visibilityError) {
        console.error('[useLeaderboardActions] Error updating leaderboard visibility:', visibilityError);
      } else {
        console.log('[useLeaderboardActions] Leaderboard visibility updated to true');
      }
    } else {
      // Insert new record if it doesn't exist
      const { error: insertError } = await supabase
        .from('system_settings')
        .insert({
          key: 'leaderboard_visibility',
          value: { isVisible: true },
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('[useLeaderboardActions] Error inserting leaderboard visibility:', insertError);
      } else {
        console.log('[useLeaderboardActions] Leaderboard visibility record created');
      }
    }
  } catch (error) {
    console.error('[useLeaderboardActions] Error triggering leaderboard:', error);
  }
};