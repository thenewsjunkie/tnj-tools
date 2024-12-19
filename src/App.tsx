import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <GlobalQueueManager />
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

            {/* Protected Routes - Grouped under /admin path */}
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route index element={<Admin />} />
              <Route path="ai" element={<AI />} />
              <Route path="settings" element={<Settings />} />
              <Route path="instructions" element={<Instructions />} />
              <Route path="settings/chat" element={<ChatSettings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;