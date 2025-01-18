import { useEffect, useRef, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { SystemSettingsRow, LeaderboardVisibilityValue } from '@/integrations/supabase/types/tables/system';

export const LEADERBOARD_DISPLAY_DURATION = 10000; // 10 seconds

export const useLeaderboardVisibility = () => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const instanceIdRef = useRef(`instance-${Math.random().toString(36).substr(2, 9)}`);
  const [isVisible, setIsVisible] = useState(false);

  const clearExistingTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startHideTimer = () => {
    clearExistingTimer();
    console.log(`[useLeaderboardVisibility ${instanceIdRef.current}] Starting hide timer`);
    
    timerRef.current = setTimeout(async () => {
      console.log(`[useLeaderboardVisibility ${instanceIdRef.current}] Auto-hiding leaderboard`);
      const { error: hideError } = await supabase
        .from('system_settings')
        .update({
          value: { isVisible: false },
          updated_at: new Date().toISOString()
        })
        .eq('key', 'leaderboard_visibility');

      if (hideError) {
        console.error(`[useLeaderboardVisibility ${instanceIdRef.current}] Error hiding leaderboard:`, hideError);
      } else {
        console.log(`[useLeaderboardVisibility ${instanceIdRef.current}] Hide operation successful`);
      }
    }, LEADERBOARD_DISPLAY_DURATION);
  };

  useEffect(() => {
    console.log(`[useLeaderboardVisibility ${instanceIdRef.current}] Hook mounted`);

    // Initial fetch of visibility state
    const fetchInitialState = async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'leaderboard_visibility')
        .single();
      
      if (data?.value) {
        const typedValue = data.value as LeaderboardVisibilityValue;
        console.log(`[useLeaderboardVisibility ${instanceIdRef.current}] Initial state:`, typedValue);
        setIsVisible(typedValue.isVisible);
        if (typedValue.isVisible) {
          startHideTimer();
        }
      }
    };

    fetchInitialState();

    // Set up realtime subscription
    const channel = supabase.channel('leaderboard-visibility')
      .on(
        'postgres_changes',
        {
          event: '*',  // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'system_settings',
          filter: 'key=eq.leaderboard_visibility'
        },
        (payload: RealtimePostgresChangesPayload<SystemSettingsRow>) => {
          console.log(`[useLeaderboardVisibility ${instanceIdRef.current}] Received visibility update:`, payload);
          
          if (payload.new && 
              typeof payload.new.value === 'object' && 
              'isVisible' in payload.new.value) {
            
            const newValue = payload.new.value as LeaderboardVisibilityValue;
            console.log(`[useLeaderboardVisibility ${instanceIdRef.current}] Setting visibility to:`, newValue.isVisible);
            setIsVisible(newValue.isVisible);
            
            if (newValue.isVisible) {
              console.log(`[useLeaderboardVisibility ${instanceIdRef.current}] Starting timer due to visibility change to true`);
              startHideTimer();
            }
          }
        }
      )
      .subscribe((status) => {
        console.log(`[useLeaderboardVisibility ${instanceIdRef.current}] Subscription status:`, status);
      });

    return () => {
      console.log(`[useLeaderboardVisibility ${instanceIdRef.current}] Hook unmounting`);
      clearExistingTimer();
      supabase.removeChannel(channel);
    };
  }, []);

  return isVisible;
};