import { Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

const VideoTools = () => {
  const openGreenScreen = () => {
    window.open("/green-screen", "_blank");
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      <Button
        variant="outline"
        className="h-24 flex flex-col gap-2 bg-[#00FF00]/10 border-[#00FF00]/30 hover:bg-[#00FF00]/20 hover:border-[#00FF00]/50"
        onClick={openGreenScreen}
      >
        <Monitor className="h-8 w-8 text-[#00FF00]" />
        <span className="text-sm font-medium">Green Screen</span>
      </Button>
    </div>
  );
};

export default VideoTools;
