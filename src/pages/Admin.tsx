import { Link } from "react-router-dom";
import Stopwatch from "@/components/Stopwatch";
import TNJLinks from "@/components/TNJLinks";
import Reviews from "@/components/reviews/Reviews";
import NewsRoundup from "@/components/NewsRoundup";
import TNJAi from "@/components/AudioChat";
import Alerts from "@/components/Alerts";
import Companion from "@/components/Companion";
import { Settings, Type, ExternalLink, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";

const Admin = () => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  console.log("[Admin] Rendering Admin page, theme:", theme);

  // Fetch lower thirds
  const { data: lowerThirds = [], isLoading } = useQuery({
    queryKey: ["lower-thirds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lower_thirds")
        .select("*")
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
              <div className="space-y-4">
                {isLoading ? (
                  <div>Loading...</div>
                ) : (
                  lowerThirds.map((lt) => (
                    <div key={lt.id} className="flex items-center justify-between p-3 bg-secondary rounded-md">
                      <div>
                        <h3 className="font-medium">{lt.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {lt.type} - {lt.primary_text}
                        </p>
                      </div>
                      <Switch
                        checked={lt.is_active}
                        onCheckedChange={(checked) =>
                          toggleActiveMutation.mutate({ id: lt.id, isActive: checked })
                        }
                      />
                    </div>
                  ))
                )}
              </div>
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
    </div>
  );
};

export default Admin;
