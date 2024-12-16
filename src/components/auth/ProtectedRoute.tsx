import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useProfileStatus } from "@/hooks/useProfileStatus";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [session, setSession] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isApproved, checkApprovalStatus } = useProfileStatus();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
      if (session) {
        checkApprovalStatus(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(!!session);
      if (session) {
        checkApprovalStatus(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  // Redirect if not logged in
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if not approved
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

  return children;
};