import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import GlobalQueueManager from "@/components/alerts/GlobalQueueManager";
import { useEffect } from "react";
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

// Configure QueryClient with minimal defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

// Route change tracker component
const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    console.log("[Router] Route changed to:", location.pathname);
  }, [location]);

  return null;
};

// AdminRoute component to protect admin routes
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', session.user.id)
          .single();
        
        setIsAuthenticated(profile?.status === 'approved');
      }
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', session.user.id)
          .single();
        
        setIsAuthenticated(profile?.status === 'approved');
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return null;
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