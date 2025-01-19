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
          event: 'UPDATE', // Listen for status updates
          schema: 'public',
          table: 'polls',
          filter: 'status=eq.active'
        },
        (payload) => {
          console.log('Poll status change detected:', payload);
          onDataChange();
        }
      )
      // Listen for new polls
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // Listen for new polls
          schema: 'public',
          table: 'polls'
        },
        (payload) => {
          console.log('New poll detected:', payload);
          // Check if the new poll is active
          if ((payload.new as any).status === 'active') {
            onDataChange();
          }
        }
      )
      // Listen for poll option changes
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
      supabase.removeChannel(channel);
    };
  }, [onDataChange]);
};