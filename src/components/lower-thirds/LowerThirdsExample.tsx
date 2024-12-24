import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const LowerThirdsExample = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all lower thirds
  const { data: lowerThirds, isLoading } = useQuery({
    queryKey: ["lower-thirds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lower_thirds")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Toggle active state mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      // First, deactivate all other lower thirds if activating one
      if (isActive) {
        await supabase
          .from("lower_thirds")
          .update({ is_active: false })
          .neq("id", id);
      }

      // Then update the selected lower third
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
      console.error("Error updating lower third:", error);
      toast({
        title: "Error",
        description: "Failed to update lower third status",
        variant: "destructive",
      });
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">Lower Thirds Example</h2>
      <div className="space-y-2">
        {lowerThirds?.map((lt) => (
          <div
            key={lt.id}
            className="flex items-center justify-between p-4 bg-background border rounded-lg"
          >
            <div>
              <h3 className="font-semibold">{lt.title}</h3>
              <p className="text-sm text-muted-foreground">
                {lt.primary_text} - {lt.secondary_text}
              </p>
            </div>
            <Button
              variant={lt.is_active ? "default" : "outline"}
              onClick={() => toggleActiveMutation.mutate({ id: lt.id, isActive: !lt.is_active })}
            >
              {lt.is_active ? "Deactivate" : "Activate"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LowerThirdsExample;