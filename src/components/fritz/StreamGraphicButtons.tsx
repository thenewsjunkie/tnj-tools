import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";

const StreamGraphicButtons = () => {
  const { theme } = useTheme();

  return (
    <div className="fixed bottom-8 left-8 flex flex-col space-y-4">
      <Button
        variant="ghost"
        className={`${
          theme === 'dark' ? 'bg-black text-white' : 'text-black'
        } hover:text-neon-red transition-colors px-4 py-2 border border-white/20 rounded`}
      >
        Stream Graphic 1
      </Button>
      <Button
        variant="ghost"
        className={`${
          theme === 'dark' ? 'bg-black text-white' : 'text-black'
        } hover:text-neon-red transition-colors px-4 py-2 border border-white/20 rounded`}
      >
        Stream Graphic 2
      </Button>
    </div>
  );
};

export default StreamGraphicButtons;