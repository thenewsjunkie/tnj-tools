import { Monitor, Link, Tv, PictureInPicture2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const VideoTools = () => {
  const openGreenScreen = () => {
    window.open("/green-screen", "_blank");
  };

  const openResources = () => {
    window.open("/resources", "_blank");
  };

  const openLowerThirdGenerator = () => {
    window.open("/lower-third-generator", "_blank");
  };

  const openInsertGenerator = () => {
    window.open("/insert-generator", "_blank");
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
      <Button
        variant="outline"
        className="h-24 flex flex-col gap-2 bg-primary/10 border-primary/30 hover:bg-primary/20 hover:border-primary/50"
        onClick={openResources}
      >
        <Link className="h-8 w-8 text-primary" />
        <span className="text-sm font-medium">Resources</span>
      </Button>
      <Button
        variant="outline"
        className="h-24 flex flex-col gap-2 bg-destructive/10 border-destructive/30 hover:bg-destructive/20 hover:border-destructive/50"
        onClick={openLowerThirdGenerator}
      >
        <Tv className="h-8 w-8 text-destructive" />
        <span className="text-sm font-medium">Lower Third</span>
      </Button>
      <Button
        variant="outline"
        className="h-24 flex flex-col gap-2 bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50"
        onClick={openInsertGenerator}
      >
        <PictureInPicture2 className="h-8 w-8 text-blue-500" />
        <span className="text-sm font-medium">Insert</span>
      </Button>
    </div>
  );
};

export default VideoTools;
