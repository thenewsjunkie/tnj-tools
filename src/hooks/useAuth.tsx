import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Only get initial session if we're on an admin route
    if (!window.location.pathname.startsWith('/admin')) {
      return;
    }

    console.log('[useAuth] Initializing auth for admin route');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[useAuth] Initial session:', !!session);
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[useAuth] Auth state changed:', _event);
      setSession(session);
    });

    return () => {
      console.log('[useAuth] Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  return { session };
};