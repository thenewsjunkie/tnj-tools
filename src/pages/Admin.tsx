import { Link } from "react-router-dom";
import { useState } from "react";
import Stopwatch from "@/components/Stopwatch";
import TNJLinks from "@/components/TNJLinks";
import Reviews from "@/components/reviews/Reviews";
import NewsRoundup from "@/components/NewsRoundup";
import TNJAi from "@/components/AudioChat";
import Alerts from "@/components/Alerts";
import Companion from "@/components/Companion";
import { Settings, Type, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import QuickEditDialog from "@/components/lower-thirds/QuickEditDialog";
import SortableLowerThirds from "@/components/lower-thirds/SortableLowerThirds";

const Admin = () => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLowerThird, setSelectedLowerThird] = useState<Tables<"lower_thirds"> | null>(null);
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  
  console.log("[Admin] Rendering Admin page, theme:", theme);

  // Fetch lower thirds
  const { data: lowerThirds = [], isLoading } = useQuery({
    queryKey: ["lower-thirds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lower_thirds")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Tables<"lower_thirds">[];
    },
  });

  // Toggle active state mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      if (isActive) {
        // Deactivate all other lower thirds first
        await supabase
          .from("lower_thirds")
          .update({ is_active: false })
          .neq("id", id);
      }

      const { error } = await supabase
        .from("lower_thirds")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lower-thirds"] });
      toast({
        title: "Success",
        description: "Lower third status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update lower third status",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("lower_thirds")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lower-thirds"] });
      toast({
        title: "Success",
        description: "Lower third deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete lower third",
        variant: "destructive",
      });
    },
  });

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
            <Settings className="h-5 w-5" />
            <span className="hidden sm:inline">Settings</span>
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
          <Card className="w-full bg-background border border-gray-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Lower Thirds
                <div className="flex items-center gap-2">
                  <Link to="/lower-third" className="text-sm">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Preview
                    </Button>
                  </Link>
                  <Link to="/admin/lower-thirds">
                    <Button 
                      size="sm"
                      className="bg-neon-red text-white border-2 border-tnj-dark hover:bg-neon-red"
                    >
                      <Type className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                <SortableLowerThirds
                  lowerThirds={lowerThirds}
                  onToggleActive={(id, isActive) =>
                    toggleActiveMutation.mutate({ id, isActive })
                  }
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onEdit={() => {}}
                  onQuickEdit={(lt) => {
                    setSelectedLowerThird(lt);
                    setIsQuickEditOpen(true);
                  }}
                />
              )}
            </CardContent>
          </Card>
          <Companion />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <Reviews 
            showViewAllLink={true} 
            simpleView={true} 
            limit={10} 
          />
          <NewsRoundup />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Stopwatch />
          <TNJLinks />
        </div>
      </div>

      <QuickEditDialog
        lowerThird={selectedLowerThird}
        open={isQuickEditOpen}
        onOpenChange={setIsQuickEditOpen}
      />
    </div>
  );
};

export default Admin;