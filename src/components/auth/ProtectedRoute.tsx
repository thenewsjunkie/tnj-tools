import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useProfileStatus } from "@/hooks/useProfileStatus";

export const ProtectedRoute = () => {
  const [session, setSession] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isApproved, checkApprovalStatus } = useProfileStatus();
  const location = useLocation();

  // Immediately return Outlet for non-admin routes
  if (!location.pathname.startsWith('/admin')) {
    return <Outlet />;
  }

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        console.log("[ProtectedRoute] Checking session for admin route...");
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (currentSession) {
          console.log("[ProtectedRoute] User authenticated, checking approval status...");
          await checkApprovalStatus(currentSession.user.id);
          setSession(true);
        } else {
          setSession(false);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("[ProtectedRoute] Error checking session:", error);
        if (mounted) {
          setSession(false);
          setIsLoading(false);
        }
      }
    };

    // Only set up auth subscription for admin routes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("[ProtectedRoute] Auth state changed:", _event);
      if (!mounted) return;
      
      if (session) {
        await checkApprovalStatus(session.user.id);
        setSession(true);
      } else {
        setSession(false);
      }
      setIsLoading(false);
    });

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkApprovalStatus]);

  if (isLoading) {
    console.log("[ProtectedRoute] Still loading...");
    return null;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isApproved === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">Account Pending Approval</h1>
          <p className="text-muted-foreground">
            Your account is pending approval from an administrator.
          </p>
          <Button
            onClick={() => supabase.auth.signOut()}
            variant="outline"
          >
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  console.log("[ProtectedRoute] Rendering protected content");
  return <Outlet />;
};