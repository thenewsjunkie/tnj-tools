import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { LogOut, ArrowLeft, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserModerationPanel } from "@/components/settings/UserModerationPanel";

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

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
      <nav className="flex justify-between items-center mb-8">
        <Link
          to="/admin"
          className="text-foreground hover:text-primary transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Admin
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/instructions">
            <Button
              variant="ghost"
              className="text-foreground hover:text-primary hover:bg-white/10 flex items-center gap-2"
            >
              <BookOpen className="h-5 w-5" />
              Instructions
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight dark:text-white">Settings</h2>
            <p className="text-sm text-muted-foreground">
              Manage user access and application settings
            </p>
          </div>
        </div>

        <UserModerationPanel />
      </div>
    </div>
  );
};

export default Settings;