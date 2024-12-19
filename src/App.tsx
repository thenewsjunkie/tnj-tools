import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import GlobalQueueManager from "@/components/alerts/GlobalQueueManager";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useEffect } from "react";
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
      staleTime: 1000 * 60 * 5, // 5 minutes
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

// AdminLayout component to wrap admin routes
const AdminLayout = () => (
  <>
    <GlobalQueueManager />
    <Outlet />
  </>
);

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
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/ai" element={<AI />} />
                <Route path="/admin/settings" element={<Settings />} />
                <Route path="/admin/instructions" element={<Instructions />} />
                <Route path="/admin/settings/chat" element={<ChatSettings />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;