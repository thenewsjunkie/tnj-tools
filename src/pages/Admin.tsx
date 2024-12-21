import { Link } from "react-router-dom";
import Stopwatch from "@/components/Stopwatch";
import TNJLinks from "@/components/TNJLinks";
import ShowNotes from "@/components/ShowNotes";
import Reviews from "@/components/reviews/Reviews";
import NewsRoundup from "@/components/NewsRoundup";
import TNJAi from "@/components/AudioChat";
import Alerts from "@/components/Alerts";
import Companion from "@/components/Companion";
import { Edit2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";

const Admin = () => {
  const { theme } = useTheme();
  
  console.log("[Admin] Rendering Admin page, theme:", theme);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <Link 
          to="/" 
          className="text-foreground hover:text-neon-red transition-colors"
        >
          ← Home
        </Link>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/thenewsjunkie/tnj-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
          >
            <Edit2 className="h-5 w-5" />
            <span className="hidden sm:inline">Edit</span>
          </a>
          <ThemeToggle />
          <h1 className="text-foreground text-xl sm:text-2xl digital">TNJ Tools</h1>
          <Link to="/admin/settings">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-primary hover:bg-white/10"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </nav>
      
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <TNJAi />
          <Alerts />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <Reviews 
            showViewAllLink={true} 
            simpleView={true} 
            limit={5} 
          />
          <Companion />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <ShowNotes />
          <NewsRoundup />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Stopwatch />
          <TNJLinks />
        </div>
      </div>
    </div>
  );
};

export default Admin;