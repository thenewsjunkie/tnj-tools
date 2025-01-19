import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollCardProps {
  poll: {
    id: string;
    question: string;
    status: string;
    created_at: string;
    image_url?: string;
    poll_options: PollOption[];
  };
  editingPoll: { 
    id: string; 
    question: string;
    options?: PollOption[];
  } | null;
  setEditingPoll: (poll: { 
    id: string; 
    question: string;
    options?: PollOption[];
  } | null) => void;
  handleDelete: (pollId: string) => Promise<void>;
  handleUpdatePoll: () => Promise<void>;
}

export function PollCard({ poll, editingPoll, setEditingPoll, handleDelete, handleUpdatePoll }: PollCardProps) {
  const handleEditClick = () => {
    setEditingPoll({ 
      id: poll.id, 
      question: poll.question,
      options: [...poll.poll_options]
    });
  };

  const handleOptionChange = (optionId: string, newText: string) => {
    if (!editingPoll) return;
    
    const updatedOptions = editingPoll.options?.map(option => 
      option.id === optionId ? { ...option, text: newText } : option
    );

    setEditingPoll({
      ...editingPoll,
      options: updatedOptions
    });
  };

  return (
    <div className="p-6 rounded-lg border transition-all duration-200 dark:border-white/10 dark:bg-black/40 backdrop-blur-sm hover:dark:bg-black/50">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            {poll.question}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm dark:text-white/60">
              Created {format(new Date(poll.created_at), 'MMM d, yyyy h:mm a')}
            </span>
            <span className="text-sm px-2 py-1 rounded-full capitalize dark:bg-white/10 dark:text-white/80">
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
                  className="dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                  onClick={handleEditClick}
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
                      onChange={(e) => setEditingPoll({ 
                        ...editingPoll!,
                        question: e.target.value 
                      })}
                      className="dark:bg-black/50 dark:border-white/10"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Options</Label>
                    {editingPoll?.options?.map((option, index) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <Input
                          value={option.text}
                          onChange={(e) => handleOptionChange(option.id, e.target.value)}
                          className="dark:bg-black/50 dark:border-white/10"
                          placeholder={`Option ${index + 1}`}
                        />
                      </div>
                    ))}
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
                className="dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
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
            className="flex justify-between items-center p-3 rounded dark:bg-black/30 dark:text-white/90"
          >
            <span className="font-medium">{option.text}</span>
            <span className="text-sm px-3 py-1 rounded-full dark:bg-white/10 dark:text-white/80">
              {option.votes} votes
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}