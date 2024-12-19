import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import GlobalQueueManager from "@/components/alerts/GlobalQueueManager";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import AI from "./pages/AI";
import Notes from "./pages/Notes";
import Reviews from "./pages/Reviews";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Instructions from "./pages/Instructions";
import Chat from "./pages/Chat";
import ChatSettings from "./pages/ChatSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

const RouteTracker = () => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    console.log("[Router] Route changed to:", location.pathname);
    
    // Set transitioning state
    setIsTransitioning(true);
    
    // Clear transition state after a short delay
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 100); // Increased from 50ms to 100ms for smoother transitions

    return () => {
      clearTimeout(timer);
    };
  }, [location]);

  // Add a div that covers the screen during transitions
  if (isTransitioning) {
    return (
      <div 
        className="fixed inset-0 bg-black z-50 transition-opacity duration-100" 
        style={{ opacity: 0.5 }}
      />
    );
  }

  return null;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('[AdminRoute] No session found');
          setIsAuthenticated(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', session.user.id)
          .single();
        
        const isApproved = profile?.status === 'approved';
        console.log('[AdminRoute] User authentication status:', isApproved);
        setIsAuthenticated(isApproved);
      } catch (error) {
        console.error('[AdminRoute] Error checking auth:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AdminRoute] Auth state changed:', event);
      
      if (!session) {
        setIsAuthenticated(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', session.user.id)
        .single();
      
      setIsAuthenticated(profile?.status === 'approved');
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <>
      <GlobalQueueManager />
      {children}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouteTracker />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/alerts/queue/:action" element={<Alerts />} />
            <Route path="/alerts/:alertSlug" element={<Alerts />} />
            <Route path="/alerts/:alertSlug/:username" element={<Alerts />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin/ai" element={<AdminRoute><AI /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><Settings /></AdminRoute>} />
            <Route path="/admin/instructions" element={<AdminRoute><Instructions /></AdminRoute>} />
            <Route path="/admin/settings/chat" element={<AdminRoute><ChatSettings /></AdminRoute>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;