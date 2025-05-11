
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { Settings, ChevronDown, ChevronUp } from "lucide-react";

const StreamGraphicButtons = () => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  // Base URL for the current score display
  const baseUrl = "/fritz/current-score";
  
  // URLs for different display modes
  const displayModes = {
    default: baseUrl,
    compactCorner: `${baseUrl}?compact=true`,
    compactCornerNoImages: `${baseUrl}?compact=true&hideImages=true`,
    compactCornerWithControls: `${baseUrl}?compact=true&showControls=true`,
    horizontalCompact: `${baseUrl}?compact=true&layout=horizontal`,
    horizontalCompactNoImages: `${baseUrl}?compact=true&layout=horizontal&hideImages=true`,
    horizontalCompactLarge: `${baseUrl}?compact=true&layout=horizontal&fontSize=large&hideImages=true`,
    largeFont: `${baseUrl}?fontSize=large`,
    extraLargeFont: `${baseUrl}?fontSize=xl&hideImages=true`,
    extraExtraLargeFont: `${baseUrl}?fontSize=xxl&hideImages=true`,
    smallFont: `${baseUrl}?fontSize=small&compact=true`,
    topLeft: `${baseUrl}?compact=true&position=top-left`,
    topRight: `${baseUrl}?compact=true&position=top-right`,
    bottomLeft: `${baseUrl}?compact=true&position=bottom-left`,
    bottomRight: `${baseUrl}?compact=true&position=bottom-right`,
  };

  return (
    <div className="md:fixed relative bottom-8 left-8 flex flex-col space-y-4 mt-8 mx-4 md:mx-0 mb-8">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div className="flex flex-col space-y-2">
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline"
              className="w-full md:w-auto bg-black/80 text-white hover:text-neon-red transition-colors px-6 py-3 border border-white/20 rounded-lg backdrop-blur-sm flex items-center justify-between"
            >
              <span className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Stream Graphic Options
              </span>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-2 space-y-2">
            <div className="bg-black/80 border border-white/20 rounded-lg p-4">
              <h3 className="text-white font-bold mb-3">Standard Displays</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Link to={displayModes.default}>
                  <Button
                    variant="ghost"
                    className="w-full bg-black/40 text-white hover:text-neon-red border border-white/10"
                  >
                    Full Size Display
                  </Button>
                </Link>
                <Link to={displayModes.largeFont}>
                  <Button
                    variant="ghost"
                    className="w-full bg-black/40 text-white hover:text-neon-red border border-white/10"
                  >
                    Large Font Display
                  </Button>
                </Link>
                <Link to={displayModes.extraLargeFont}>
                  <Button
                    variant="ghost"
                    className="w-full bg-black/40 text-white hover:text-neon-red border border-white/10"
                  >
                    XL Score (No Images)
                  </Button>
                </Link>
                <Link to={displayModes.extraExtraLargeFont}>
                  <Button
                    variant="ghost"
                    className="w-full bg-black/40 text-white hover:text-neon-red border border-white/10"
                  >
                    XXL Score (No Images)
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-black/80 border border-white/20 rounded-lg p-4">
              <h3 className="text-white font-bold mb-3">Compact Corner Displays</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Link to={displayModes.compactCorner}>
                  <Button
                    variant="ghost"
                    className="w-full bg-black/40 text-white hover:text-neon-red border border-white/10"
                  >
                    Compact Corner
                  </Button>
                </Link>
                <Link to={displayModes.compactCornerNoImages}>
                  <Button
                    variant="ghost"
                    className="w-full bg-black/40 text-white hover:text-neon-red border border-white/10"
                  >
                    Compact (No Images)
                  </Button>
                </Link>
                <Link to={displayModes.compactCornerWithControls}>
                  <Button
                    variant="ghost"
                    className="w-full bg-black/40 text-white hover:text-neon-red border border-white/10"
                  >
                    Compact With Controls
                  </Button>
                </Link>
                <Link to={displayModes.smallFont}>
                  <Button
                    variant="ghost"
                    className="w-full bg-black/40 text-white hover:text-neon-red border border-white/10"
                  >
                    Small Font Compact
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-black/80 border border-white/20 rounded-lg p-4">
              <h3 className="text-white font-bold mb-3">Horizontal Layout Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Link to={displayModes.horizontalCompact}>
                  <Button
                    variant="ghost"
                    className="w-full bg-black/40 text-white hover:text-neon-red border border-white/10"
                  >
                    Horizontal Compact
                  </Button>
                </Link>
                <Link to={displayModes.horizontalCompactNoImages}>
                  <Button
                    variant="ghost"
                    className="w-full bg-black/40 text-white hover:text-neon-red border border-white/10"
                  >
                    Horizontal (No Images)
                  </Button>
                </Link>
                <Link to={displayModes.horizontalCompactLarge}>
                  <Button
                    variant="ghost"
                    className="w-full bg-black/40 text-white hover:text-neon-red border border-white/10"
                  >
                    Horizontal Large Score
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-black/80 border border-white/20 rounded-lg p-4">
              <h3 className="text-white font-bold mb-3">Position Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Link to={displayModes.topLeft}>
                  <Button
                    variant="ghost"
                    className="w-full bg-black/40 text-white hover:text-neon-red border border-white/10"
                  >
                    Top Left
                  </Button>
                </Link>
                <Link to={displayModes.topRight}>
                  <Button
                    variant="ghost"
                    className="w-full bg-black/40 text-white hover:text-neon-red border border-white/10"
                  >
                    Top Right
                  </Button>
                </Link>
                <Link to={displayModes.bottomLeft}>
                  <Button
                    variant="ghost"
                    className="w-full bg-black/40 text-white hover:text-neon-red border border-white/10"
                  >
                    Bottom Left
                  </Button>
                </Link>
                <Link to={displayModes.bottomRight}>
                  <Button
                    variant="ghost"
                    className="w-full bg-black/40 text-white hover:text-neon-red border border-white/10"
                  >
                    Bottom Right
                  </Button>
                </Link>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
      
      <Link to="/fritz/total-score">
        <Button
          variant="ghost"
          className="w-full md:w-auto bg-black/80 text-white hover:text-neon-red transition-colors px-6 py-3 border border-white/20 rounded-lg backdrop-blur-sm uppercase tracking-wider"
        >
          Total Score Display
        </Button>
      </Link>
    </div>
  );
};

export default StreamGraphicButtons;
