import { Link } from "react-router-dom";
import { Type, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SortableLowerThirds from "@/components/lower-thirds/SortableLowerThirds";

const LowerThirdsCard = ({ 
  lowerThirds,
  isLoading,
  onQuickEdit 
}: { 
  lowerThirds: Tables<"lower_thirds">[],
  isLoading: boolean,
  onQuickEdit: (lt: Tables<"lower_thirds">) => void
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Toggle active state mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive, duration }: { id: string; isActive: boolean; duration?: number }) => {
      if (isActive) {
        await supabase
          .from("lower_thirds")
          .update({ is_active: false })
          .neq("id", id);
      }

      const { error } = await supabase
        .from("lower_thirds")
        .update({ 
          is_active: isActive,
          duration_seconds: duration || null 
        })
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
            onToggleActive={(id, isActive, duration) =>
              toggleActiveMutation.mutate({ id, isActive, duration })
            }
            onDelete={(id) => deleteMutation.mutate(id)}
            onEdit={() => {}}
            onQuickEdit={onQuickEdit}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default LowerThirdsCard;