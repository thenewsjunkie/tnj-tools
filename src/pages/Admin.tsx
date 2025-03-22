
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

const Admin = () => {
  const { theme } = useTheme();
  const [selectedLowerThird, setSelectedLowerThird] = useState<Tables<"lower_thirds"> | null>(null);
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  
  // Collapsible states for each module
  const [isLowerThirdsOpen, setIsLowerThirdsOpen] = useState(true);
  const [isVideoBytesOpen, setIsVideoBytesOpen] = useState(true);
  const [isReviewsOpen, setIsReviewsOpen] = useState(true);
  const [isTriggersOpen, setIsTriggersOpen] = useState(true);
  
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
        
        {/* Content Management Module */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-black rounded-lg shadow p-4 border border-white/10">
            <h3 className="text-lg font-medium mb-4">Content Management</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="/admin/manage-gifs" className="block p-4 border border-white/10 rounded-lg hover:bg-accent transition-colors">
                <h4 className="font-medium">Manage GIFs</h4>
                <p className="text-sm text-muted-foreground">Review, approve, and manage uploaded GIFs</p>
              </a>
              <a href="/admin/manage-polls" className="block p-4 border border-white/10 rounded-lg hover:bg-accent transition-colors">
                <h4 className="font-medium">Manage Polls</h4>
                <p className="text-sm text-muted-foreground">Create, edit, and manage interactive polls</p>
              </a>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Collapsible Lower Thirds Module */}
          <Collapsible open={isLowerThirdsOpen} onOpenChange={setIsLowerThirdsOpen} className="w-full">
            <div className="bg-black rounded-lg shadow border border-white/10">
              <div className="p-4 pb-0 flex justify-between items-center">
                <h3 className="text-lg font-medium">Lower Thirds</h3>
                <CollapsibleTrigger asChild>
                  <button className="p-1 hover:bg-accent rounded-md transition-colors">
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isLowerThirdsOpen ? '' : 'rotate-180'}`} />
                    <span className="sr-only">Toggle Lower Thirds</span>
                  </button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="p-4 pt-2">
                  <LowerThirdsCard
                    lowerThirds={lowerThirds}
                    isLoading={isLoading}
                    onQuickEdit={(lt) => {
                      setSelectedLowerThird(lt);
                      setIsQuickEditOpen(true);
                    }}
                  />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
          
          {/* Collapsible Video Bytes Module */}
          <Collapsible open={isVideoBytesOpen} onOpenChange={setIsVideoBytesOpen} className="w-full">
            <div className="bg-black rounded-lg shadow border border-white/10">
              <div className="p-4 pb-0 flex justify-between items-center">
                <h3 className="text-lg font-medium">Video Bytes</h3>
                <CollapsibleTrigger asChild>
                  <button className="p-1 hover:bg-accent rounded-md transition-colors">
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isVideoBytesOpen ? '' : 'rotate-180'}`} />
                    <span className="sr-only">Toggle Video Bytes</span>
                  </button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="p-4 pt-2">
                  <VideoBytes />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Collapsible Reviews Module */}
          <Collapsible open={isReviewsOpen} onOpenChange={setIsReviewsOpen} className="w-full">
            <div className="bg-black rounded-lg shadow border border-white/10">
              <div className="p-4 pb-0 flex justify-between items-center">
                <h3 className="text-lg font-medium">Reviews</h3>
                <CollapsibleTrigger asChild>
                  <button className="p-1 hover:bg-accent rounded-md transition-colors">
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isReviewsOpen ? '' : 'rotate-180'}`} />
                    <span className="sr-only">Toggle Reviews</span>
                  </button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="p-4 pt-2">
                  <Reviews 
                    showViewAllLink={true} 
                    simpleView={true} 
                    limit={10} 
                  />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
          
          {/* Collapsible Triggers Module */}
          <Collapsible open={isTriggersOpen} onOpenChange={setIsTriggersOpen} className="w-full">
            <div className="bg-black rounded-lg shadow border border-white/10">
              <div className="p-4 pb-0 flex justify-between items-center">
                <h3 className="text-lg font-medium">Triggers</h3>
                <CollapsibleTrigger asChild>
                  <button className="p-1 hover:bg-accent rounded-md transition-colors">
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isTriggersOpen ? '' : 'rotate-180'}`} />
                    <span className="sr-only">Toggle Triggers</span>
                  </button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="p-4 pt-2">
                  <Companion />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
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
};

export default Admin;
