import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { LogOut, ArrowLeft, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UserModerationPanel } from "@/components/settings/UserModerationPanel";
import { useEffect, useState } from "react";

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('[Settings] No session found, redirecting to login');
        navigate('/login');
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;

        const userIsAdmin = profile?.role === 'admin';
        console.log('[Settings] User admin status:', userIsAdmin);
        
        setIsAdmin(userIsAdmin);
        if (!userIsAdmin) {
          toast({
            title: "Unauthorized",
            description: "You need admin access to view this page",
            variant: "destructive",
          });
          navigate('/');
        }
      } catch (error) {
        console.error('[Settings] Error checking admin status:', error);
        toast({
          title: "Error",
          description: "Failed to verify permissions",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
        <div className="max-w-5xl mx-auto flex items-center justify-center">
          <div className="text-foreground text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

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
          <Link to="/admin/instructions">
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
            <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
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