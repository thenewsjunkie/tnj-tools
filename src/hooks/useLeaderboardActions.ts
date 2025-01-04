import { supabase } from "@/integrations/supabase/client";
import { queryClient } from "@/lib/react-query";

export const triggerLeaderboard = async () => {
  try {
    console.log('[useLeaderboardActions] Triggering leaderboard');

    // Invalidate the giftStats query to force a refresh
    await queryClient.invalidateQueries({ queryKey: ['giftStats'] });

    const { error: visibilityError } = await supabase
      .from('system_settings')
      .update({
        value: { isVisible: true }
      })
      .eq('key', 'leaderboard_visibility');

    if (visibilityError) {
      console.error('[useLeaderboardActions] Error updating leaderboard visibility:', visibilityError);
    } else {
      console.log('[useLeaderboardActions] Leaderboard triggered successfully');
    }
  } catch (error) {
    console.error('[useLeaderboardActions] Error triggering leaderboard:', error);
  }
};