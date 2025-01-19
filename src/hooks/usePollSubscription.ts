import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type FetchCallback = () => void;

export const usePollSubscription = (onDataChange: FetchCallback) => {
  useEffect(() => {
    // Create a single channel for all poll-related changes
    const channel = supabase.channel('poll-updates')
      // Listen for poll changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'polls',
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
          event: '*',
          schema: 'public',
          table: 'poll_options',
        },
        (payload) => {
          console.log('Poll option change detected:', payload);
          onDataChange();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [onDataChange]);
};