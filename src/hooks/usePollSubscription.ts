import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type FetchCallback = () => void;

export const usePollSubscription = (onDataChange: FetchCallback) => {
  useEffect(() => {
    console.log('Setting up poll subscription...');
    
    // Initial fetch
    onDataChange();

    // Create a single channel for all poll-related changes
    const channel = supabase.channel('poll-updates')
      // Listen for poll changes
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'polls',
          filter: 'status=eq.active' // Only listen for active polls
        },
        (payload) => {
          console.log('Poll change detected:', payload);
          onDataChange();
        }
      )
      // Listen for poll option changes
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'poll_options'
        },
        (payload) => {
          console.log('Poll option change detected:', payload);
          onDataChange();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up poll subscription');
      supabase.removeChannel(channel);
    };
  }, [onDataChange]);
};