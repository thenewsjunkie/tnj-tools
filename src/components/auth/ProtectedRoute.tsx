import { useEffect, useState, useCallback } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useProfileStatus } from "@/hooks/useProfileStatus";

export const ProtectedRoute = () => {
  const [session, setSession] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isApproved, checkApprovalStatus } = useProfileStatus();
  const location = useLocation();

  // Only protect admin routes - immediately return Outlet for non-admin routes
  if (!location.pathname.startsWith('/admin')) {
    return <Outlet />;
  }

  const checkSession = useCallback(async () => {
    try {
      console.log("[ProtectedRoute] Checking session...");
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log("[ProtectedRoute] Session state:", !!currentSession);
      
      setSession(!!currentSession);
      if (currentSession) {
        console.log("[ProtectedRoute] User authenticated, checking approval status...");
        await checkApprovalStatus(currentSession.user.id);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("[ProtectedRoute] Error checking session:", error);
      setSession(null);
      setIsLoading(false);
    }
  }, [checkApprovalStatus]);

  useEffect(() => {
    let mounted = true;
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("[ProtectedRoute] Auth state changed:", _event);
      if (!mounted) return;
      
      setSession(!!session);
      if (session) {
        await checkApprovalStatus(session.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkSession]);

  // Show nothing while loading
  if (isLoading) {
    console.log("[ProtectedRoute] Still loading...");
    return null;
  }

  // Redirect if not logged in
  if (!session) {
    console.log("[ProtectedRoute] No session, redirecting to login");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Only show approval pending screen if explicitly not approved
  if (isApproved === false) {
    console.log("[ProtectedRoute] User not approved");
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