
import { useLocation, Navigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { session } = useAuth(); // Use our centralized auth hook
  
  const checkAuth = useCallback(async () => {
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
  }, [session, toast]);
  
  useEffect(() => {
    console.log('[AdminRoute] Component mounted, checking authentication');
    checkAuth();
    // No need for auth subscription here since we're using useAuth
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
