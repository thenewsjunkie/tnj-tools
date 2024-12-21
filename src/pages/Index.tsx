import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-4">
      <nav className="fixed top-0 right-0 p-4 flex items-center gap-4">
        <div className="flex items-center">
          <ThemeToggle />
        </div>
        <Link 
          to="/login" 
          className={`${
            theme === 'light' ? 'text-black' : 'text-white'
          } hover:text-neon-red transition-colors px-4 py-2 border border-white/20 rounded`}
        >
          Login
        </Link>
      </nav>
      
      <div className={`digital text-[clamp(2rem,10vw,6rem)] leading-none ${
        theme === 'light' ? 'text-red-600' : 'text-neon-red'
      } animate-led-flicker tracking-tight mb-8 mt-20`}>
        TNJ Tools
      </div>

      <Link to="/survey">
        <Button 
          variant="outline" 
          size="lg"
          className="gap-2 text-lg hover:text-neon-red transition-colors"
        >
          <ClipboardList className="w-6 h-6" />
          Audience Survey
        </Button>
      </Link>
      
      <div className={`fixed bottom-8 ${theme === 'light' ? 'text-black' : 'text-white/50'} text-sm`}>
        tnjtools.com
      </div>
    </div>
  );
};

export default Index;