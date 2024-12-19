import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get current pathname
    const currentPath = window.location.pathname;
    
    // Only initialize auth if we're on an admin route
    if (!currentPath.startsWith('/admin')) {
      console.log('[useAuth] Skipping auth initialization for non-admin route:', currentPath);
      return;
    }

    console.log('[useAuth] Initializing auth for admin route:', currentPath);
    
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[useAuth] Initial session:', !!session);
      setSession(session);
    };

    getInitialSession();

    // Listen for auth changes only on admin routes
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
  }, [window.location.pathname]); // Re-run when pathname changes

  return { session };
};