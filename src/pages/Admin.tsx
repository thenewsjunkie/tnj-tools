import { Link, useNavigate } from "react-router-dom";
import Stopwatch from "@/components/Stopwatch";
import TNJLinks from "@/components/TNJLinks";
import ShowNotes from "@/components/ShowNotes";
import NewsRoundup from "@/components/NewsRoundup";
import TNJAi from "@/components/AudioChat";
import Alerts from "@/components/Alerts";
import { LogOut, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-foreground hover:text-neon-red hover:bg-white/10"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </nav>
      
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="w-full">
          <TNJAi />
        </div>
        <div className="w-full">
          <ShowNotes />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div className="md:col-span-2">
            <NewsRoundup />
          </div>
          <Alerts />
          <Stopwatch />
          <TNJLinks />
        </div>
      </div>
    </div>
  );
};

export default Admin;