
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Get current pathname
    const currentPath = window.location.pathname;
    
    console.log('[useAuth] Initializing auth for route:', currentPath);
    
    let mounted = true;
    
    // Only set up the auth once to prevent multiple subscriptions
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      
      // Get initial session
      const getInitialSession = async () => {
        try {
          setIsLoading(true);
          const { data: { session } } = await supabase.auth.getSession();
          
          if (mounted) {
            console.log('[useAuth] Initial session loaded:', !!session);
            setSession(session);
          }
        } catch (error) {
          console.error('[useAuth] Error getting session:', error);
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      };

      getInitialSession();

      // Set up the auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) {
          console.log('[useAuth] Auth state changed:', _event);
          setSession(session);
        }
      });

      // Cleanup function
      return () => {
        console.log('[useAuth] Cleaning up auth subscription');
        mounted = false;
        subscription.unsubscribe();
        hasInitialized.current = false; // Reset for next mount
      };
    }
    
    return () => {
      mounted = false;
    };
  }, []); // Don't add window.location.pathname as dependency to avoid re-subscribing

  return { session, isLoading };
};
