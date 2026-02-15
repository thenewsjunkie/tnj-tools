import { useState } from "react";
import { Link } from "react-router-dom";
import { Monitor, Link as LinkIcon, Tv, PictureInPicture2, Clock, BarChart3, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminPolls from "@/components/admin/AdminPolls";
import TimerSettings from "@/components/admin/TimerSettings";

type SubPanel = "timer" | "polls" | null;

const VideoTools = () => {
  const [activePanel, setActivePanel] = useState<SubPanel>(null);

  const togglePanel = (panel: SubPanel) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        <Button
          variant="outline"
          className="h-16 flex flex-col gap-1 bg-[#00FF00]/10 border-[#00FF00]/30 hover:bg-[#00FF00]/20 hover:border-[#00FF00]/50"
          onClick={() => window.open("/green-screen", "_blank")}
        >
          <Monitor className="h-5 w-5 text-[#00FF00]" />
          <span className="text-xs font-medium">Green Screen</span>
        </Button>
        <Button
          variant="outline"
          className="h-16 flex flex-col gap-1 bg-primary/10 border-primary/30 hover:bg-primary/20 hover:border-primary/50"
          onClick={() => window.open("/resources", "_blank")}
        >
          <LinkIcon className="h-5 w-5 text-primary" />
          <span className="text-xs font-medium">Resources</span>
        </Button>
        <Button
          variant="outline"
          className="h-16 flex flex-col gap-1 bg-destructive/10 border-destructive/30 hover:bg-destructive/20 hover:border-destructive/50"
          onClick={() => window.open("/lower-third-generator", "_blank")}
        >
          <Tv className="h-5 w-5 text-destructive" />
          <span className="text-xs font-medium">Lower Third</span>
        </Button>
        <Button
          variant="outline"
          className="h-16 flex flex-col gap-1 bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50"
          onClick={() => window.open("/insert-generator", "_blank")}
        >
          <PictureInPicture2 className="h-5 w-5 text-blue-500" />
          <span className="text-xs font-medium">Insert</span>
        </Button>
        <Button
          variant="outline"
          className={`h-16 flex flex-col gap-1 border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-500/50 ${activePanel === "timer" ? "bg-orange-500/20 border-orange-500/50" : "bg-orange-500/10"}`}
          onClick={() => togglePanel("timer")}
        >
          <Clock className="h-5 w-5 text-orange-500" />
          <span className="text-xs font-medium">Timer</span>
        </Button>
        <Button
          variant="outline"
          className={`h-16 flex flex-col gap-1 border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500/50 ${activePanel === "polls" ? "bg-purple-500/20 border-purple-500/50" : "bg-purple-500/10"}`}
          onClick={() => togglePanel("polls")}
        >
          <BarChart3 className="h-5 w-5 text-purple-500" />
          <span className="text-xs font-medium">Polls</span>
        </Button>
      </div>

      {activePanel === "timer" && (
        <div className="border border-border/50 rounded-lg p-3 bg-muted/20">
          <TimerSettings />
        </div>
      )}

      {activePanel === "polls" && (
        <div className="border border-border/50 rounded-lg p-3 bg-muted/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-foreground">Polls</h4>
            <Link
              to="/admin/manage-polls"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
          <AdminPolls />
        </div>
      )}
    </div>
  );
};

export default VideoTools;
