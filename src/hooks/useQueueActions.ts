import { supabase } from "@/integrations/supabase/client";
import { GiftStats } from "@/integrations/supabase/types/tables/gifts";

export const useQueueActions = (refetchQueue: () => Promise<any>) => {
  const triggerLeaderboard = async () => {
    try {
      console.log('[useQueueActions] Triggering leaderboard');

      // Set leaderboard visibility to true
      const { error: visibilityError } = await supabase
        .from('system_settings')
        .update({
          value: { isVisible: true }
        })
        .eq('key', 'leaderboard_visibility');

      if (visibilityError) {
        console.error('[useQueueActions] Error updating leaderboard visibility:', visibilityError);
      } else {
        console.log('[useQueueActions] Leaderboard triggered successfully');
      }
    } catch (error) {
      console.error('[useQueueActions] Error triggering leaderboard:', error);
    }
  };

  const handleAlertComplete = async (currentAlert: any) => {
    if (!currentAlert) {
      console.log('[useQueueActions] No current alert to complete');
      return;
    }

    console.log('[useQueueActions] Completing alert:', currentAlert);

    // Start a transaction to update alert status and gift stats
    const { error } = await supabase
      .from('alert_queue')
      .update({ 
        status: 'completed',
        played_at: new Date().toISOString()
      })
      .eq('id', currentAlert.id);

    if (error) {
      console.error('[useQueueActions] Error completing alert:', error);
      return;
    }

    // If this is a gift alert, update gift stats
    if (currentAlert.alert?.is_gift_alert && currentAlert.username && currentAlert.gift_count) {
      console.log('[useQueueActions] Processing gift stats for:', {
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
        console.error('[useQueueActions] Error recording gift history:', historyError);
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
    }

    console.log('[useQueueActions] Alert marked as completed');
    
    // Create and subscribe to channel before broadcasting
    const channel = supabase.channel('alert-queue');
    await channel.subscribe();
    
    // Broadcast completion event
    await channel.send({
      type: 'broadcast',
      event: 'alert_completed',
      payload: { alert_id: currentAlert.id }
    });

    console.log('[useQueueActions] Alert completion broadcasted');
    
    // Clean up channel after broadcasting
    await supabase.removeChannel(channel);
    
    // Refetch queue to update UI
    await refetchQueue();
  };

  const processNextAlert = async (isPaused: boolean, currentAlert: any, pendingAlerts: any[]) => {
    console.log('[useQueueActions] Processing next alert. Queue paused:', isPaused);
    
    if (isPaused) {
      console.log('[useQueueActions] Queue is paused, not processing next alert');
      return;
    }

    // If there's a current alert playing, don't process the next one
    if (currentAlert) {
      console.log('[useQueueActions] Current alert still playing:', currentAlert.id);
      return;
    }

    const nextAlert = pendingAlerts[0];
    if (!nextAlert) {
      console.log('[useQueueActions] No pending alerts in queue');
      return;
    }

    // Check pause state again before processing
    const { data: settings } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'queue_state')
      .single();
    
    const queueIsPaused = settings?.value?.isPaused;
    
    if (queueIsPaused) {
      console.log('[useQueueActions] Queue is now paused, not processing next alert');
      return;
    }

    console.log('[useQueueActions] Setting next alert to playing:', nextAlert.id);

    const { error } = await supabase
      .from('alert_queue')
      .update({ status: 'playing' })
      .eq('id', nextAlert.id);

    if (error) {
      console.error('[useQueueActions] Error updating alert status:', error);
      return;
    }

    console.log('[useQueueActions] Alert status updated to playing');
    await refetchQueue();
  };

  return {
    handleAlertComplete,
    processNextAlert
  };
};