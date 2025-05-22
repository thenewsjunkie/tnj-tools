
import { useLocation, Navigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const authSubscription = useRef(null);
  
  const checkAuth = useCallback(async (session: any) => {
    if (!session) {
      console.log('[AdminRoute] No session found');
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('[AdminRoute] Error fetching profile:', error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "There was a problem verifying your account status.",
        });
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      const isApproved = profile?.status === 'approved';
      console.log('[AdminRoute] User authentication status:', isApproved);
      
      setIsAuthenticated(isApproved);
      setIsLoading(false);
    } catch (error) {
      console.error('[AdminRoute] Error checking auth:', error);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    let mounted = true;

    const initialCheck = async () => {
      console.log('[AdminRoute] Checking authentication...');
      setIsLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          checkAuth(session);
        }
      } catch (error) {
        console.error('[AdminRoute] Error getting session:', error);
        
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    };

    initialCheck();

    // Set up auth listener only if not already set up
    if (!authSubscription.current) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        console.log('[AdminRoute] Auth state changed:', _event);
        
        if (mounted) {
          checkAuth(session);
        }
      });

      authSubscription.current = subscription;
    }

    return () => {
      mounted = false;
      
      // Clean up subscription when component unmounts
      if (authSubscription.current) {
        authSubscription.current.unsubscribe();
        authSubscription.current = null;
      }
    };
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
