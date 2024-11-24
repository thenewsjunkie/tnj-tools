import { Link, useNavigate } from "react-router-dom";
import Stopwatch from "@/components/Stopwatch";
import SocialStats from "@/components/SocialStats";
import SocialGraph from "@/components/SocialGraph";
import ShowNotes from "@/components/ShowNotes";
import MediaPool from "@/components/MediaPool";
import Reminders from "@/components/Reminders";
import InterviewRequestsModule from "@/components/InterviewRequestsModule";
import ScreenShareModule from "@/components/ScreenShareModule";
import YouTubeToMp3 from "@/components/YouTubeToMp3";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

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
    <div className="min-h-screen bg-black p-4 sm:p-6 md:p-8">
      <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <Link 
          to="/" 
          className="text-white hover:text-neon-red transition-colors"
        >
          ← Home
        </Link>
        <div className="flex items-center gap-4">
          <h1 className="text-white text-xl sm:text-2xl digital">TNJ Tools Admin</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-white hover:text-neon-red hover:bg-white/10"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </nav>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
        <Reminders />
        <Stopwatch />
        <SocialStats />
        <ShowNotes />
        <div className="md:col-span-2">
          <SocialGraph />
        </div>
        <div className="md:col-span-2">
          <InterviewRequestsModule />
        </div>
        <div className="md:col-span-2">
          <ScreenShareModule />
        </div>
        <YouTubeToMp3 />
        <MediaPool />
      </div>
    </div>
  );
};

export default Admin;