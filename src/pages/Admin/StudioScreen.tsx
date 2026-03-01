import { Link } from "react-router-dom";
import SecretShowsLeaderboard from "@/components/studio/SecretShowsLeaderboard";
import HallOfFrame from "@/components/studio/HallOfFrame";
import OutputControl from "@/components/studio/OutputControl";
import RestreamChat from "@/components/studio/RestreamChat";
import AdsManager from "@/components/studio/AdsManager";
import ArtModeManager from "@/components/studio/ArtModeManager";
import OBSOverlayControl from "@/components/studio/OBSOverlayControl";
import TelePrompterControl from "@/components/studio/TelePrompterControl";
import CollapsibleModule from "@/components/admin/CollapsibleModule";

const StudioScreen = () => {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <nav className="flex items-center justify-between mb-8">
        <Link
          to="/admin"
          className="text-foreground hover:text-neon-red transition-colors"
        >
          ← Admin
        </Link>
        <h1 className="text-foreground text-xl sm:text-2xl digital">Studio Screen</h1>
        <div className="w-16" />
      </nav>
      <div className="max-w-2xl mx-auto space-y-3">
        <CollapsibleModule id="studio-output" title="Output Control" defaultOpen={false}>
          <OutputControl />
        </CollapsibleModule>
        <CollapsibleModule id="studio-obs" title="OBS Overlay" defaultOpen={false}>
          <OBSOverlayControl />
        </CollapsibleModule>
        <CollapsibleModule id="studio-ads" title="Ads Manager" defaultOpen={false}>
          <AdsManager />
        </CollapsibleModule>
        <CollapsibleModule id="studio-art-mode" title="Art Mode" defaultOpen={false}>
          <ArtModeManager />
        </CollapsibleModule>
        <CollapsibleModule id="studio-leaderboard" title="Secret Shows Leaderboard" defaultOpen={false}>
          <SecretShowsLeaderboard />
        </CollapsibleModule>
        <CollapsibleModule id="studio-hall-of-frame" title="Hall of Frame" defaultOpen={false}>
          <HallOfFrame />
        </CollapsibleModule>
        <CollapsibleModule id="studio-teleprompter" title="TelePrompter" defaultOpen={false}>
          <TelePrompterControl />
        </CollapsibleModule>
        <CollapsibleModule id="studio-chat" title="Live Chat" defaultOpen={false}>
          <RestreamChat />
        </CollapsibleModule>
      </div>
    </div>
  );
};

export default StudioScreen;
