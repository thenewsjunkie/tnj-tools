import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/components/theme/ThemeProvider";
import AdminHeader from "@/components/admin/AdminHeader";
import CollapsibleModule from "@/components/admin/CollapsibleModule";

import Alerts from "@/components/Alerts";
import Stopwatch from "@/components/Stopwatch";
import TNJLinks from "@/components/TNJLinks";
import { AskAI } from "@/components/ai-chat/AskAI";
import VoiceInterface from "@/components/VoiceInterface";
import ShowPrep from "@/components/admin/ShowPrep";
import WeekendEditionSegments from "@/components/admin/WeekendEditionSegments";
import VideoTools from "@/components/admin/VideoTools";
import AdminPolls from "@/components/admin/AdminPolls";

import { Badge } from "@/components/ui/badge";
import { useQueueState } from "@/hooks/useQueueState";
import { Mic, Archive, ExternalLink, Plus } from "lucide-react";
import PollDialog from "@/components/polls/PollDialog";

const Admin = () => {
  const { theme } = useTheme();
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(() => {
    const saved = localStorage.getItem("admin-voice-chat-open");
    return saved === "true";
  });
  const [isPollDialogOpen, setIsPollDialogOpen] = useState(false);
  const { queueCount } = useQueueState();

  useEffect(() => {
    localStorage.setItem("admin-voice-chat-open", String(isVoiceChatOpen));
  }, [isVoiceChatOpen]);
  
  console.log("[Admin] Rendering Admin page, theme:", theme);

  return (
    <div className="min-h-screen bg-background text-foreground p-3 sm:p-4">
      <AdminHeader />

      {/* Top Action Buttons */}
      <div className="flex justify-center items-center gap-4 mb-4">
        <button
          onClick={() => setIsVoiceChatOpen(!isVoiceChatOpen)}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
            isVoiceChatOpen 
              ? "bg-primary text-primary-foreground shadow-lg" 
              : "bg-muted hover:bg-muted/80 text-foreground"
          }`}
        >
          <Mic className={`h-5 w-5 ${isAISpeaking ? "animate-pulse" : ""}`} />
          <span>Ask TNJ AI</span>
          {isAISpeaking && (
            <Badge variant="secondary" className="text-xs ml-1">Speaking</Badge>
          )}
        </button>

        <button
          onClick={() => setIsPollDialogOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 bg-muted hover:bg-muted/80 text-foreground"
        >
          <Plus className="h-5 w-5" />
          <span>Poll</span>
        </button>
      </div>

      <PollDialog 
        open={isPollDialogOpen} 
        onOpenChange={setIsPollDialogOpen} 
        poll={null}
      />

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
        <CollapsibleModule 
          id="show-prep" 
          title="Show Prep" 
          defaultOpen={true}
          headerAction={
            <Link 
              to="/admin/topic-archive" 
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Archive className="h-4 w-4" />
            </Link>
          }
        >
          <ShowPrep />
        </CollapsibleModule>

        {/* Polls */}
        <CollapsibleModule
          id="polls"
          title="Polls"
          defaultOpen={false}
          headerAction={
            <Link 
              to="/admin/manage-polls" 
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          }
        >
          <AdminPolls />
        </CollapsibleModule>

        {/* Weekend Edition Segments */}
        <CollapsibleModule
          id="weekend-edition"
          title="Weekend Edition Segments"
          defaultOpen={false}
        >
          <WeekendEditionSegments />
        </CollapsibleModule>

        {/* Video Tools */}
        <CollapsibleModule
          id="video-tools"
          title="Video Tools"
          defaultOpen={false}
        >
          <VideoTools />
        </CollapsibleModule>

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

    </div>
  );
};

export default Admin;
