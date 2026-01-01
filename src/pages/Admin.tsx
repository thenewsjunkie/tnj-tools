import { useState, useEffect } from "react";
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
import ShowPrep from "@/components/admin/ShowPrep";
import WeekendEditionSegments from "@/components/admin/WeekendEditionSegments";
import { Badge } from "@/components/ui/badge";
import { useQueueState } from "@/hooks/useQueueState";
import { Mic } from "lucide-react";

const Admin = () => {
  const { theme } = useTheme();
  const [selectedLowerThird, setSelectedLowerThird] = useState<Tables<"lower_thirds"> | null>(null);
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(() => {
    const saved = localStorage.getItem("admin-voice-chat-open");
    return saved === "true";
  });
  const { queueCount } = useQueueState();

  useEffect(() => {
    localStorage.setItem("admin-voice-chat-open", String(isVoiceChatOpen));
  }, [isVoiceChatOpen]);
  
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

      {/* Centered Voice Chat Tab */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setIsVoiceChatOpen(!isVoiceChatOpen)}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
            isVoiceChatOpen 
              ? "bg-primary text-primary-foreground shadow-lg" 
              : "bg-muted hover:bg-muted/80 text-foreground"
          }`}
        >
          <Mic className={`h-5 w-5 ${isAISpeaking ? "animate-pulse" : ""}`} />
          <span>Realtime Voice Chat</span>
          {isAISpeaking && (
            <Badge variant="secondary" className="text-xs ml-1">Speaking</Badge>
          )}
        </button>
      </div>

      {/* Expandable Voice Chat Panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isVoiceChatOpen ? "max-h-[2000px] opacity-100 mb-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <VoiceInterface onSpeakingChange={setIsAISpeaking} />
        </div>
      </div>
      
      <div className="space-y-3 max-w-7xl mx-auto">
        {/* Show Prep - Full Width */}
        <CollapsibleModule id="show-prep" title="Show Prep" defaultOpen={true}>
          <ShowPrep />
        </CollapsibleModule>

        {/* Weekend Edition Segments */}
        <CollapsibleModule
          id="weekend-edition"
          title="Weekend Edition Segments"
          defaultOpen={false}
        >
          <WeekendEditionSegments />
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
