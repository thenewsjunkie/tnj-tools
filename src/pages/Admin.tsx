
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useTheme } from "@/components/theme/ThemeProvider";
import AdminHeader from "@/components/admin/AdminHeader";
import LowerThirdsCard from "@/components/admin/LowerThirdsCard";
import QuickEditDialog from "@/components/lower-thirds/QuickEditDialog";
import TNJAi from "@/components/AudioChat";
import Alerts from "@/components/Alerts";
import Companion from "@/components/Companion";
import Reviews from "@/components/reviews/Reviews";
import { VideoBytes } from "@/components/VideoBytes";
import Stopwatch from "@/components/Stopwatch";
import TNJLinks from "@/components/TNJLinks";

const Admin = () => {
  const { theme } = useTheme();
  const [selectedLowerThird, setSelectedLowerThird] = useState<Tables<"lower_thirds"> | null>(null);
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  
  console.log("[Admin] Rendering Admin page, theme:", theme);

  // Fetch lower thirds
  const { data: lowerThirds = [], isLoading } = useQuery({
    queryKey: ["lower-thirds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lower_thirds")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Tables<"lower_thirds">[];
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <AdminHeader />
      
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <TNJAi />
          <Alerts />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <LowerThirdsCard
            lowerThirds={lowerThirds}
            isLoading={isLoading}
            onQuickEdit={(lt) => {
              setSelectedLowerThird(lt);
              setIsQuickEditOpen(true);
            }}
          />
          <VideoBytes />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <Reviews 
            showViewAllLink={true} 
            simpleView={true} 
            limit={10} 
          />
          <Companion />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Stopwatch />
          <TNJLinks />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-card rounded-lg shadow p-4">
            <h3 className="text-lg font-medium mb-4">Content Management</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="/admin/manage-gifs" className="block p-4 border rounded-lg hover:bg-accent transition-colors">
                <h4 className="font-medium">Manage GIFs</h4>
                <p className="text-sm text-muted-foreground">Review, approve, and manage uploaded GIFs</p>
              </a>
            </div>
          </div>
        </div>
      </div>

      <QuickEditDialog
        lowerThird={selectedLowerThird}
        open={isQuickEditOpen}
        onOpenChange={setIsQuickEditOpen}
      />
    </div>
  );
};

export default Admin;
