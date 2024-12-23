import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Link } from "react-router-dom";

const StreamGraphicButtons = () => {
  const { theme } = useTheme();

  return (
    <div className="md:fixed relative bottom-8 left-8 flex flex-col space-y-4 mt-8 mx-4 md:mx-0 mb-8">
      <Link to="/fritz/current-score">
        <Button
          variant="ghost"
          className="w-full md:w-auto bg-black/80 text-white hover:text-neon-red transition-colors px-6 py-3 border border-white/20 rounded-lg backdrop-blur-sm uppercase tracking-wider"
        >
          Stream Graphic 1
        </Button>
      </Link>
      <Link to="/fritz/total-score">
        <Button
          variant="ghost"
          className="w-full md:w-auto bg-black/80 text-white hover:text-neon-red transition-colors px-6 py-3 border border-white/20 rounded-lg backdrop-blur-sm uppercase tracking-wider"
        >
          Stream Graphic 2
        </Button>
      </Link>
    </div>
  );
};

export default StreamGraphicButtons;