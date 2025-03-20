
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
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";

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

  // Fetch pending gifs count
  const { data: pendingGifsCount = 0 } = useQuery({
    queryKey: ["pending-gifs-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("tnj_gifs")
        .select("*", { count: 'exact', head: true })
        .eq("status", "pending");

      if (error) throw error;
      return count || 0;
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
          <div className="space-y-4">
            <Companion />
            <div className="rounded-lg border bg-card text-card-foreground shadow">
              <div className="p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Manage GIFs</h3>
                  <p className="text-sm text-muted-foreground">
                    Review and manage user-submitted GIFs
                  </p>
                </div>
                <Link to="/admin/manage-gifs">
                  <Button variant="outline" className="flex items-center gap-2">
                    <ImagePlus className="h-4 w-4" />
                    Manage GIFs
                    {pendingGifsCount > 0 && (
                      <span className="ml-1 rounded-full bg-red-500 text-white px-2 py-0.5 text-xs">
                        {pendingGifsCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Stopwatch />
          <TNJLinks />
        </div>
      </div>

      <QuickEditDialog
        lowerThird={selectedLowerThird}
        open={isQuickEditOpen}
        onOpenChange={setIsQuickEditOpen}
      />
    </div>
  );
}

export default Admin;
