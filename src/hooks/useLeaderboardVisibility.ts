import { useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types/helpers";
import type { LeaderboardVisibilityValue } from "@/integrations/supabase/types/tables/system";
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export const LEADERBOARD_DISPLAY_DURATION = 10000; // 10 seconds

type SystemSettingsRow = {
  key: string;
  value: Json;
  updated_at: string;
}

export const useLeaderboardVisibility = () => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const instanceIdRef = useRef(`instance-${Math.random().toString(36).substr(2, 9)}`);

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
          value: { isVisible: false } as unknown as Json,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'leaderboard_visibility');

      if (hideError) {
        console.error(`[useLeaderboardVisibility ${instanceIdRef.current}] Error hiding leaderboard:`, hideError);
      }
    }, LEADERBOARD_DISPLAY_DURATION);
  };

  const handleVisibilityRequest = async () => {
    console.log(`[useLeaderboardVisibility ${instanceIdRef.current}] Received show request`);
    
    // Update visibility in database
    const { error } = await supabase
      .from('system_settings')
      .update({
        value: { isVisible: true } as unknown as Json,
        updated_at: new Date().toISOString()
      })
      .eq('key', 'leaderboard_visibility');

    if (error) {
      console.error(`[useLeaderboardVisibility ${instanceIdRef.current}] Error updating visibility:`, error);
      return;
    }

    // Timer will be started by the subscription handler
  };

  useEffect(() => {
    console.log(`[useLeaderboardVisibility ${instanceIdRef.current}] Hook mounted`);

    // Handle POST requests using a custom event
    const handlePostRequest = async () => {
      handleVisibilityRequest();
    };

    // Create a route handler for POST requests
    const originalFetchFunction = window.fetch;
    if (typeof window !== 'undefined') {
      window.fetch = async function(input, init) {
        if (input === '/leaderboard/obs' && init?.method === 'POST') {
          handlePostRequest();
          return new Response(null, { status: 200 });
        }
        return originalFetchFunction.apply(this, [input, init]);
      };
    }

    // Also listen for message events
    window.addEventListener('message', (event) => {
      if (event.data === 'show-leaderboard') {
        handleVisibilityRequest();
      }
    });

    // Set up realtime subscription
    const channel = supabase.channel('leaderboard-visibility')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings',
          filter: 'key=eq.leaderboard_visibility'
        },
        (payload: RealtimePostgresChangesPayload<SystemSettingsRow>) => {
          console.log(`[useLeaderboardVisibility ${instanceIdRef.current}] Received visibility update:`, payload);
          
          // Check if payload.new exists and has the expected structure
          if (payload.new && 
              typeof payload.new === 'object' && 
              'value' in payload.new && 
              payload.new.value !== null && 
              typeof payload.new.value === 'object') {
            
            // Type assertion after runtime checks
            const newValue = payload.new.value as { isVisible: boolean };
            
            // Only start timer when visibility changes to true
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
      // Clear any existing timer
      clearExistingTimer();
      
      // Restore original fetch
      if (typeof window !== 'undefined') {
        window.fetch = originalFetchFunction;
      }
      
      // Clean up subscription
      supabase.removeChannel(channel);
    };
  }, []);
};