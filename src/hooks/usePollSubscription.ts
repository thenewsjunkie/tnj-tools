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
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events
          schema: 'public',
          table: 'polls'
        },
        (payload) => {
          console.log('Poll change detected:', payload);
          // Always fetch data for any poll changes
          onDataChange();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events on poll options
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
      void supabase.removeChannel(channel);
    };
  }, [onDataChange]);
};