
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

// Create a module-level variable to track if auth is initialized globally
let globalAuthInitialized = false;

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Use a ref to track subscription at the component level
  const subscription = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    // Get current pathname for logging
    const currentPath = window.location.pathname;
    console.log('[useAuth] Initializing auth for route:', currentPath);
    
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // First get the initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          console.log('[useAuth] Initial session loaded:', !!initialSession);
          setSession(initialSession);
        }
        
        // Only set up the listener if we don't already have one
        if (!subscription.current) {
          console.log('[useAuth] Setting up new auth subscription');
          
          const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
            if (mounted) {
              console.log('[useAuth] Auth state changed:', _event);
              setSession(newSession);
            }
          });
          
          subscription.current = data.subscription;
        }
      } catch (error) {
        console.error('[useAuth] Error during auth initialization:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Only initialize auth once globally
    if (!globalAuthInitialized) {
      globalAuthInitialized = true;
      initializeAuth();
    } else {
      // If already initialized, just update loading state
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      console.log('[useAuth] Component unmounting on route:', currentPath);
      mounted = false;
      
      // We don't unsubscribe here anymore - auth subscription is kept alive
      // for the lifetime of the application
    };
  }, []); // Empty dependency array to run only once

  return { session, isLoading };
};
