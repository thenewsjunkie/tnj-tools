
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useTheme } from "@/components/theme/ThemeProvider";
import AdminHeader from "@/components/admin/AdminHeader";
import LowerThirdsCard from "@/components/admin/LowerThirdsCard";
import QuickEditDialog from "@/components/lower-thirds/QuickEditDialog";

import Alerts from "@/components/Alerts";
import Stopwatch from "@/components/Stopwatch";
import TNJLinks from "@/components/TNJLinks";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { AskAI } from "@/components/ai-chat/AskAI";
import VoiceInterface from "@/components/VoiceInterface";
const Admin = () => {
  const { theme } = useTheme();
  const [selectedLowerThird, setSelectedLowerThird] = useState<Tables<"lower_thirds"> | null>(null);
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  
  // Realtime voice chat status
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  
  // Collapsible states for each module
  const [isLowerThirdsOpen, setIsLowerThirdsOpen] = useState(true);
  
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
        {/* Realtime Voice Chat (v1.0) */}
        <div className="bg-black rounded-lg shadow border border-white/10">
          <div className="p-4 pb-0 flex justify-between items-center">
            <h3 className="text-lg font-medium">Realtime Voice Chat (v1.0)</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className={`h-2 w-2 rounded-full ${isAISpeaking ? 'bg-primary' : 'bg-border'}`} />
              <span>{isAISpeaking ? 'AI speaking' : 'Idle'}</span>
            </div>
          </div>
          <div className="p-4 pt-2">
            <VoiceInterface onSpeakingChange={setIsAISpeaking} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <Alerts />
          <AskAI />
        </div>
        
        
        {/* Full-width Lower Thirds Module */}
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
