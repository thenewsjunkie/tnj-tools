import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { QueuePagination } from "@/components/queue/QueuePagination";
import { PollList } from "@/components/polls/PollList";
import { LoadingState } from "@/components/polls/LoadingState";

const POLLS_PER_PAGE = 10;

export default function Polls() {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPoll, setEditingPoll] = useState<{ 
    id: string; 
    question: string;
    options?: Array<{
      id: string;
      text: string;
      votes: number;
    }>;
  } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['polls', currentPage],
    queryFn: async () => {
      const startRange = (currentPage - 1) * POLLS_PER_PAGE;
      const endRange = startRange + POLLS_PER_PAGE - 1;

      const { data: polls, count, error } = await supabase
        .from('polls')
        .select(`
          *,
          poll_options (
            id,
            text,
            votes
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(startRange, endRange);

      if (error) throw error;
      return { polls, totalCount: count || 0 };
    },
  });

  const handleDelete = async (pollId: string) => {
    try {
      const { error: optionsError } = await supabase
        .from('poll_options')
        .delete()
        .eq('poll_id', pollId);

      if (optionsError) throw optionsError;

      const { error: pollError } = await supabase
        .from('polls')
        .delete()
        .eq('id', pollId);

      if (pollError) throw pollError;

      toast({
        title: "Poll deleted successfully",
        duration: 3000,
      });

      queryClient.invalidateQueries({ queryKey: ['polls'] });
    } catch (error) {
      console.error('Error deleting poll:', error);
      toast({
        title: "Error deleting poll",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleUpdatePoll = async () => {
    if (!editingPoll) return;

    try {
      // Update poll question
      const { error: pollError } = await supabase
        .from('polls')
        .update({ question: editingPoll.question })
        .eq('id', editingPoll.id)
        .eq('status', 'active');

      if (pollError) throw pollError;

      // Update poll options
      if (editingPoll.options) {
        const updatePromises = editingPoll.options.map(option =>
          supabase
            .from('poll_options')
            .update({ text: option.text })
            .eq('id', option.id)
        );

        await Promise.all(updatePromises);
      }

      toast({
        title: "Poll updated successfully",
        duration: 3000,
      });

      queryClient.invalidateQueries({ queryKey: ['polls'] });
      setEditingPoll(null);
    } catch (error) {
      console.error('Error updating poll:', error);
      toast({
        title: "Error updating poll",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const totalPages = Math.ceil((data?.totalCount || 0) / POLLS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        <Link 
          to="/admin" 
          className="inline-flex items-center text-sm mb-8 text-foreground/70 hover:text-foreground transition-colors"
        >
          ← Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-8 text-foreground">Poll Archive</h1>
        
        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            <PollList
              polls={data?.polls || []}
              editingPoll={editingPoll}
              setEditingPoll={setEditingPoll}
              handleDelete={handleDelete}
              handleUpdatePoll={handleUpdatePoll}
            />

            <div className="mt-8">
              <QueuePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}