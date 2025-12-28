import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useTheme } from "@/components/theme/ThemeProvider";
import AdminHeader from "@/components/admin/AdminHeader";
import LowerThirdsCard from "@/components/admin/LowerThirdsCard";
import QuickEditDialog from "@/components/lower-thirds/QuickEditDialog";
import CollapsibleModule from "@/components/admin/CollapsibleModule";

import Alerts from "@/components/Alerts";
import Stopwatch from "@/components/Stopwatch";
import TNJLinks from "@/components/TNJLinks";
import { AskAI } from "@/components/ai-chat/AskAI";
import VoiceInterface from "@/components/VoiceInterface";
import { Badge } from "@/components/ui/badge";
import { useQueueState } from "@/hooks/useQueueState";
import { SoundEffectsLibrary } from "@/components/sound-effects/SoundEffectsLibrary";

const Admin = () => {
  const { theme } = useTheme();
  const [selectedLowerThird, setSelectedLowerThird] = useState<Tables<"lower_thirds"> | null>(null);
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const { queueCount } = useQueueState();
  
  console.log("[Admin] Rendering Admin page, theme:", theme);

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
    <div className="min-h-screen bg-background text-foreground p-3 sm:p-4">
      <AdminHeader />
      
      <div className="space-y-3 max-w-7xl mx-auto">
        {/* Voice Chat - Full Width */}
        <CollapsibleModule
          id="voice-chat"
          title="Realtime Voice Chat"
          statusBadge={
            isAISpeaking ? (
              <Badge variant="secondary" className="text-xs">Speaking</Badge>
            ) : null
          }
        >
          <VoiceInterface onSpeakingChange={setIsAISpeaking} />
        </CollapsibleModule>

        {/* Row: Alerts + Ask AI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <CollapsibleModule
            id="alerts"
            title="Alerts"
            defaultOpen={false}
            statusBadge={
              queueCount > 0 ? (
                <Badge variant="secondary" className="text-xs">{queueCount}</Badge>
              ) : null
            }
          >
            <Alerts />
          </CollapsibleModule>
          
          <CollapsibleModule id="ask-ai" title="Ask AI" defaultOpen={false}>
            <AskAI />
          </CollapsibleModule>
        </div>

        {/* Sound Effects Library - Full Width */}
        <CollapsibleModule id="sound-effects" title="Sound Effects" defaultOpen={false}>
          <SoundEffectsLibrary />
        </CollapsibleModule>
        
        {/* Lower Thirds - Full Width */}
        <CollapsibleModule id="lower-thirds" title="Lower Thirds" defaultOpen={false}>
          <LowerThirdsCard
            lowerThirds={lowerThirds}
            isLoading={isLoading}
            onQuickEdit={(lt) => {
              setSelectedLowerThird(lt);
              setIsQuickEditOpen(true);
            }}
          />
        </CollapsibleModule>
        
        {/* Row: Stopwatch + TNJ Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <CollapsibleModule id="stopwatch" title="Stopwatch" defaultOpen={false}>
            <Stopwatch />
          </CollapsibleModule>
          
          <CollapsibleModule id="tnj-links" title="TNJ Links" defaultOpen={false}>
            <TNJLinks />
          </CollapsibleModule>
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
