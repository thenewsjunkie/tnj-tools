
import { useLocation, Navigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const checkAuth = useCallback(async (session: any) => {
    if (!session) {
      console.log('[AdminRoute] No session found');
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', session.user.id)
        .single();
      
      const isApproved = profile?.status === 'approved';
      console.log('[AdminRoute] User authentication status:', isApproved);
      
      setIsAuthenticated(isApproved);
      setIsLoading(false);
    } catch (error) {
      console.error('[AdminRoute] Error checking auth:', error);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    let mounted = true;

    const initialCheck = async () => {
      console.log('[AdminRoute] Checking authentication...');
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        checkAuth(session);
      }
    };

    initialCheck();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[AdminRoute] Auth state changed:', _event);
      if (mounted) {
        checkAuth(session);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
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
