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
    const { data: existingSettings, error: fetchError } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', 'leaderboard_visibility')
      .single();

    if (fetchError) {
      console.error('[useLeaderboardActions] Error fetching leaderboard visibility:', fetchError);
      return;
    }

    const now = new Date().toISOString();
    const visibilityValue = {
      isVisible: true,
      lastUpdated: now
    };

    console.log('[useLeaderboardActions] Current settings:', existingSettings);

    if (existingSettings) {
      console.log('[useLeaderboardActions] Updating existing record with:', visibilityValue);
      
      // Update existing record
      const { data: updateData, error: visibilityError } = await supabase
        .from('system_settings')
        .update({
          value: visibilityValue,
          updated_at: now
        })
        .eq('key', 'leaderboard_visibility')
        .select();

      if (visibilityError) {
        console.error('[useLeaderboardActions] Error updating leaderboard visibility:', visibilityError);
      } else {
        console.log('[useLeaderboardActions] Update successful:', updateData);
      }
    } else {
      console.log('[useLeaderboardActions] Creating new record with:', visibilityValue);
      
      // Insert new record if it doesn't exist
      const { data: insertData, error: insertError } = await supabase
        .from('system_settings')
        .insert({
          key: 'leaderboard_visibility',
          value: visibilityValue,
          updated_at: now
        })
        .select();

      if (insertError) {
        console.error('[useLeaderboardActions] Error inserting leaderboard visibility:', insertError);
      } else {
        console.log('[useLeaderboardActions] Insert successful:', insertData);
      }
    }
  } catch (error) {
    console.error('[useLeaderboardActions] Error triggering leaderboard:', error);
  }
};