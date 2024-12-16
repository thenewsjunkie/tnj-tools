import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import GlobalQueueManager from "@/components/alerts/GlobalQueueManager";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import AI from "./pages/AI";
import Notes from "./pages/Notes";
import Reviews from "./pages/Reviews";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);

  useEffect(() => {
    console.log('[ProtectedRoute] Component mounted');
    
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[ProtectedRoute] Initial session check:", session?.user);
      setSession(!!session);
      if (session?.user) {
        checkApprovalStatus(session.user.id);
      } else {
        console.log("[ProtectedRoute] No session found");
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[ProtectedRoute] Auth state change:", event, session?.user);
      setSession(!!session);
      if (session?.user) {
        await checkApprovalStatus(session.user.id);
      } else {
        console.log("[ProtectedRoute] No session in auth change");
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkApprovalStatus = async (userId: string) => {
    try {
      console.log("[ProtectedRoute] Checking approval status for user:", userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('status, role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error("[ProtectedRoute] Error checking approval status:", error);
        setIsLoading(false);
        return;
      }

      console.log("[ProtectedRoute] Profile data received:", profile);

      if (!profile) {
        console.error("[ProtectedRoute] No profile found for user:", userId);
        setIsApproved(false);
        setIsLoading(false);
        return;
      }

      // More robust check for admin role and approval status
      const isAdmin = profile.role?.toLowerCase() === 'admin';
      const isStatusApproved = profile.status?.toLowerCase() === 'approved';
      const isUserApproved = isAdmin || isStatusApproved;

      console.log("[ProtectedRoute] User status:", profile.status);
      console.log("[ProtectedRoute] User role:", profile.role);
      console.log("[ProtectedRoute] Is admin:", isAdmin);
      console.log("[ProtectedRoute] Is status approved:", isStatusApproved);
      console.log("[ProtectedRoute] Final approval status:", isUserApproved);
      
      setIsApproved(isUserApproved);
      setIsLoading(false);
    } catch (error) {
      console.error("[ProtectedRoute] Error in checkApprovalStatus:", error);
      setIsLoading(false);
    }
  };

  // Show nothing while loading
  if (isLoading) {
    console.log("[ProtectedRoute] Still loading...");
    return null;
  }

  // Redirect if not logged in
  if (!session) {
    console.log("[ProtectedRoute] No session, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Redirect if not approved
  if (isApproved === false) {
    console.log("[ProtectedRoute] User not approved, showing pending message");
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <GlobalQueueManager />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/alerts/:alertSlug" element={<Alerts />} />
            <Route path="/alerts/:alertSlug/:username" element={<Alerts />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ai"
              element={
                <ProtectedRoute>
                  <AI />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;