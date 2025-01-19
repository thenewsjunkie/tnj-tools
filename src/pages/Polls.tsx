import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { QueuePagination } from "@/components/queue/QueuePagination";

const POLLS_PER_PAGE = 10;

export default function Polls() {
  const [currentPage, setCurrentPage] = useState(1);
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

  const totalPages = Math.ceil((data?.totalCount || 0) / POLLS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">Poll Archive</h1>
        <div className="dark:text-white/70">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Poll Archive</h1>
      
      <div className="grid gap-4">
        {data?.polls.map((poll) => (
          <div 
            key={poll.id} 
            className="p-4 rounded-lg border dark:border-white/10 dark:bg-black/40 backdrop-blur-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-lg font-semibold dark:text-white">{poll.question}</h2>
                <p className="text-sm dark:text-white/60">
                  Created {format(new Date(poll.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="dark:bg-black/90 dark:backdrop-blur-sm dark:border-white/10">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-white">Delete Poll</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-white/70">
                      Are you sure you want to delete this poll? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(poll.id)}
                      className="dark:bg-red-500 dark:text-white dark:hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {poll.image_url && (
              <img 
                src={poll.image_url} 
                alt={poll.question}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
            )}

            <div className="space-y-2">
              {poll.poll_options.map((option) => (
                <div 
                  key={option.id}
                  className="flex justify-between items-center dark:text-white/90"
                >
                  <span>{option.text}</span>
                  <span className="text-sm dark:text-white/60">
                    {option.votes} votes
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <QueuePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}