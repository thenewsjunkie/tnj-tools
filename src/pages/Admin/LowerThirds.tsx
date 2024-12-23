import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import LowerThirdForm from "@/components/lower-thirds/LowerThirdForm";
import LowerThirdItem from "@/components/lower-thirds/LowerThirdItem";

type LowerThird = Tables<"lower_thirds">;
type NewLowerThird = Omit<LowerThird, "id" | "created_at" | "updated_at">;

const LowerThirds = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all lower thirds
  const { data: lowerThirds, isLoading } = useQuery({
    queryKey: ["lower-thirds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lower_thirds")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LowerThird[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (newLowerThird: NewLowerThird) => {
      const { data, error } = await supabase
        .from("lower_thirds")
        .insert([newLowerThird])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lower-thirds"] });
      toast({
        title: "Lower third created",
        description: "New lower third has been created successfully.",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (lowerThird: LowerThird) => {
      const { error } = await supabase
        .from("lower_thirds")
        .update({
          title: lowerThird.title,
          type: lowerThird.type,
          primary_text: lowerThird.primary_text,
          secondary_text: lowerThird.secondary_text,
          ticker_text: lowerThird.ticker_text,
          show_time: lowerThird.show_time,
          is_active: lowerThird.is_active,
          style_config: lowerThird.style_config,
          guest_image_url: lowerThird.guest_image_url,
        })
        .eq("id", lowerThird.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lower-thirds"] });
      toast({
        title: "Lower third updated",
        description: "The lower third has been updated successfully.",
      });
    },
  });

  // Toggle active state mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      if (isActive) {
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
        title: "Lower third deleted",
        description: "The lower third has been deleted successfully.",
      });
    },
  });

  const handleSubmit = (data: NewLowerThird) => {
    createMutation.mutate(data);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <nav className="mb-6">
        <Link 
          to="/admin" 
          className="text-foreground hover:text-neon-red transition-colors"
        >
          ← Back to Admin
        </Link>
      </nav>

      <h1 className="text-2xl font-bold mb-6">Lower Thirds Manager</h1>

      <LowerThirdForm
        onSubmit={handleSubmit}
        submitLabel="Create Lower Third"
      />

      <div className="space-y-4">
        {lowerThirds?.map((lt) => (
          <LowerThirdItem
            key={lt.id}
            lowerThird={lt}
            onToggleActive={(id, isActive) =>
              toggleActiveMutation.mutate({ id, isActive })
            }
            onDelete={(id) => deleteMutation.mutate(id)}
            onEdit={(lt) => updateMutation.mutate(lt)}
          />
        ))}
      </div>
    </div>
  );
};

export default LowerThirds;