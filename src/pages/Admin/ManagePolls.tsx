
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import PollList from "@/components/polls/PollList";
import PollDialog from "@/components/polls/PollDialog";

const ManagePolls = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activePoll, setActivePoll] = useState<any>(null);

  const { data: polls = [], isLoading } = useQuery({
    queryKey: ["polls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("polls")
        .select("*, poll_options(*)")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching polls",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      return data;
    },
  });

  const handleCreatePoll = () => {
    setActivePoll(null);
    setIsDialogOpen(true);
  };

  const handleEditPoll = (poll: any) => {
    setActivePoll(poll);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Polls</h1>
          <Button onClick={handleCreatePoll} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Create Poll</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12">
            <p className="text-muted-foreground">Loading polls...</p>
          </div>
        ) : (
          <PollList 
            polls={polls} 
            onEdit={handleEditPoll} 
          />
        )}

        <PollDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          poll={activePoll}
        />
      </div>
    </div>
  );
};

export default ManagePolls;
