import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { QueuePagination } from "@/components/queue/QueuePagination";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const POLLS_PER_PAGE = 10;

export default function Polls() {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPoll, setEditingPoll] = useState<{ id: string; question: string } | null>(null);
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
      const { error } = await supabase
        .from('polls')
        .update({ question: editingPoll.question })
        .eq('id', editingPoll.id)
        .eq('status', 'active');

      if (error) throw error;

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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 min-h-screen bg-background">
        <div className="max-w-6xl mx-auto">
          <Link 
            to="/admin" 
            className="inline-flex items-center text-sm mb-8 text-foreground/70 hover:text-foreground transition-colors"
          >
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-8 text-foreground">Poll Archive</h1>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-black/20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        <Link 
          to="/admin" 
          className="inline-flex items-center text-sm mb-8 text-foreground/70 hover:text-foreground transition-colors"
        >
          ← Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-8 text-foreground">Poll Archive</h1>
        
        <div className="grid gap-6">
          {data?.polls.map((poll) => (
            <div 
              key={poll.id} 
              className="p-6 rounded-lg border transition-all duration-200
                dark:border-white/10 dark:bg-black/40 backdrop-blur-sm
                hover:dark:bg-black/50"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    {poll.question}
                  </h2>
                  <div className="flex items-center gap-4">
                    <span className="text-sm dark:text-white/60">
                      Created {format(new Date(poll.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                    <span className="text-sm px-2 py-1 rounded-full capitalize
                      dark:bg-white/10 dark:text-white/80">
                      {poll.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {poll.status === 'active' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="dark:text-white/70 dark:hover:text-white 
                            dark:hover:bg-white/10 transition-colors"
                          onClick={() => setEditingPoll({ id: poll.id, question: poll.question })}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="dark:bg-black/90 dark:backdrop-blur-sm dark:border-white/10">
                        <DialogHeader>
                          <DialogTitle className="dark:text-white">Edit Active Poll</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="question">Question</Label>
                            <Input
                              id="question"
                              value={editingPoll?.question || ''}
                              onChange={(e) => setEditingPoll(prev => prev ? { ...prev, question: e.target.value } : null)}
                              className="dark:bg-black/50 dark:border-white/10"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="ghost"
                            onClick={() => setEditingPoll(null)}
                            className="dark:text-white/70 dark:hover:bg-white/10"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUpdatePoll}
                            className="dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                          >
                            Save Changes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="dark:text-white/70 dark:hover:text-white 
                          dark:hover:bg-white/10 transition-colors"
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
                          className="bg-red-500 text-white hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {poll.image_url && (
                <img 
                  src={poll.image_url} 
                  alt={poll.question}
                  className="w-full h-48 object-cover rounded-md mb-6"
                />
              )}

              <div className="space-y-3 border-t dark:border-white/10 pt-4">
                {poll.poll_options.map((option) => (
                  <div 
                    key={option.id}
                    className="flex justify-between items-center p-3 rounded
                      dark:bg-black/30 dark:text-white/90"
                  >
                    <span className="font-medium">{option.text}</span>
                    <span className="text-sm px-3 py-1 rounded-full
                      dark:bg-white/10 dark:text-white/80">
                      {option.votes} votes
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <QueuePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}