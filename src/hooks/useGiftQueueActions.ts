import { supabase } from "@/integrations/supabase/client";
import { triggerLeaderboard } from "./useLeaderboardActions";

export const handleGiftStats = async (currentAlert: any) => {
  if (!currentAlert.alert?.is_gift_alert || !currentAlert.username || !currentAlert.gift_count) {
    return;
  }

  console.log('[useGiftQueueActions] Processing gift stats for:', {
    username: currentAlert.username,
    giftCount: currentAlert.gift_count
  });
  
  // Record in gift history
  const { error: historyError } = await supabase
    .from('gift_history')
    .insert({
      gifter_username: currentAlert.username.toLowerCase(),
      gift_count: currentAlert.gift_count,
      alert_queue_id: currentAlert.id
    });

  if (historyError) {
    console.error('[useGiftQueueActions] Error recording gift history:', historyError);
    return;
  }

  // Get existing stats
  const { data: existingStats, error: statsError } = await supabase
    .from('gift_stats')
    .select('*')
    .eq('username', currentAlert.username.toLowerCase())
    .maybeSingle();

  if (!statsError) {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const yearKey = now.getFullYear().toString();

    if (existingStats) {
      // Update existing stats
      const monthlyGifts = {
        ...(existingStats.monthly_gifts as Record<string, number>),
        [monthKey]: ((existingStats.monthly_gifts as Record<string, number>)[monthKey] || 0) + currentAlert.gift_count
      };
      
      const yearlyGifts = {
        ...(existingStats.yearly_gifts as Record<string, number>),
        [yearKey]: ((existingStats.yearly_gifts as Record<string, number>)[yearKey] || 0) + currentAlert.gift_count
      };

      await supabase
        .from('gift_stats')
        .update({
          total_gifts: existingStats.total_gifts + currentAlert.gift_count,
          last_gift_date: now.toISOString(),
          monthly_gifts: monthlyGifts,
          yearly_gifts: yearlyGifts
        })
        .eq('username', currentAlert.username.toLowerCase());
    } else {
      // Create new stats record
      const monthlyGifts: Record<string, number> = { [monthKey]: currentAlert.gift_count };
      const yearlyGifts: Record<string, number> = { [yearKey]: currentAlert.gift_count };

      await supabase
        .from('gift_stats')
        .insert({
          username: currentAlert.username.toLowerCase(),
          total_gifts: currentAlert.gift_count,
          last_gift_date: now.toISOString(),
          monthly_gifts: monthlyGifts,
          yearly_gifts: yearlyGifts
        });
    }

    // Only trigger leaderboard after gift stats are fully updated
    await triggerLeaderboard();
  }
};