
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
      console.log('Fetching lower thirds...');
      const { data, error } = await supabase
        .from("lower_thirds")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Error fetching lower thirds:', error);
        throw error;
      }
      console.log('Fetched lower thirds:', data);
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
          logo_url: lowerThird.logo_url,
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
      console.log('Starting deletion process for lower third with ID:', id);
      
      // First, verify the lower third exists
      const { data: existing, error: checkError } = await supabase
        .from("lower_thirds")
        .select('id, is_active')
        .eq('id', id)
        .single();
      
      if (checkError) {
        console.error('Error checking lower third existence:', checkError);
        throw checkError;
      }

      if (!existing) {
        console.error('Lower third not found:', id);
        throw new Error('Lower third not found');
      }

      console.log('Found lower third:', existing);

      // Deactivate if active
      if (existing.is_active) {
        console.log('Deactivating lower third...');
        const { error: deactivateError } = await supabase
          .from("lower_thirds")
          .update({ is_active: false })
          .eq("id", id);
        
        if (deactivateError) {
          console.error('Error deactivating lower third:', deactivateError);
          throw deactivateError;
        }
        console.log('Lower third deactivated successfully');
      }

      // Add a delay after deactivation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Delete the lower third
      console.log('Proceeding with deletion...');
      const { error: deleteError, count } = await supabase
        .from("lower_thirds")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error('Error deleting lower third:', deleteError);
        throw deleteError;
      }

      console.log('Delete operation completed. Rows affected:', count);

      // Verify deletion
      const { data: verifyData, error: verifyError } = await supabase
        .from("lower_thirds")
        .select('id')
        .eq('id', id)
        .single();
      
      if (verifyError && verifyError.code !== 'PGRST116') {
        console.error('Error verifying deletion:', verifyError);
        throw verifyError;
      }

      if (verifyData) {
        console.error('Lower third still exists after deletion!');
        throw new Error('Failed to delete lower third');
      }

      console.log('Deletion verified - lower third no longer exists');
      return id;
    },
    onSuccess: (deletedId) => {
      console.log('Delete mutation succeeded for ID:', deletedId);
      
      // Update cache immediately
      queryClient.setQueryData(["lower-thirds"], (old: LowerThird[] | undefined) => {
        console.log('Updating cache. Old data:', old);
        const newData = old ? old.filter(lt => lt.id !== deletedId) : [];
        console.log('New cache data:', newData);
        return newData;
      });

      // Delay the refetch
      setTimeout(() => {
        console.log('Invalidating queries to trigger refetch...');
        queryClient.invalidateQueries({ queryKey: ["lower-thirds"] });
      }, 1000);
      
      toast({
        title: "Lower third deleted",
        description: "The lower third has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to delete lower third. Please try again.",
        variant: "destructive",
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
