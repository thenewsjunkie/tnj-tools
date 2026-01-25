
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Loader2 } from "lucide-react";

interface PollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  poll: any | null;
}

const PollDialog: React.FC<PollDialogProps> = ({ open, onOpenChange, poll }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>([""]);
  const [isCreatingOnStrawpoll, setIsCreatingOnStrawpoll] = useState(false);
  const isEditing = !!poll;

  useEffect(() => {
    if (poll) {
      setQuestion(poll.question);
      setOptions(poll.poll_options.map((opt: any) => opt.text));
    } else {
      setQuestion("");
      setOptions([""]);
    }
  }, [poll, open]);

  const createPollMutation = useMutation({
    mutationFn: async () => {
      setIsCreatingOnStrawpoll(true);
      
      const validOptions = options.filter(opt => opt.trim() !== "");
      
      // First, create the poll on Strawpoll
      const { data: strawpollData, error: strawpollError } = await supabase.functions.invoke('strawpoll', {
        body: {
          action: 'create',
          question,
          options: validOptions,
        },
      });

      if (strawpollError || !strawpollData?.success) {
        throw new Error(strawpollData?.error || strawpollError?.message || 'Failed to create poll on Strawpoll');
      }

      console.log('Strawpoll created:', strawpollData);

      // Then create the poll in our database with Strawpoll references
      const { data: pollData, error: pollError } = await supabase
        .from("polls")
        .insert([{ 
          question, 
          status: "draft",
          strawpoll_id: strawpollData.strawpoll_id,
          strawpoll_url: strawpollData.strawpoll_url,
          strawpoll_embed_url: strawpollData.strawpoll_embed_url,
        }])
        .select();
        
      if (pollError) throw pollError;
      
      const pollId = pollData[0].id;
      
      // Create the options locally (for reference only)
      const optionsToInsert = validOptions.map(opt => ({
        poll_id: pollId,
        text: opt,
        votes: 0
      }));
        
      if (optionsToInsert.length > 0) {
        const { error: optionsError } = await supabase
          .from("poll_options")
          .insert(optionsToInsert);
          
        if (optionsError) throw optionsError;
      }
      
      return pollData[0];
    },
    onSuccess: () => {
      setIsCreatingOnStrawpoll(false);
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast({
        title: "Poll created on Strawpoll!",
        description: "The poll has been created successfully on Strawpoll.com",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      setIsCreatingOnStrawpoll(false);
      toast({
        title: "Error creating poll",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const updatePollMutation = useMutation({
    mutationFn: async () => {
      if (!poll) return null;
      
      // Note: Strawpoll doesn't support editing polls, so we only update locally
      // The user would need to delete and recreate to update on Strawpoll
      
      // Update the poll question
      const { error: pollError } = await supabase
        .from("polls")
        .update({ question })
        .eq("id", poll.id);
        
      if (pollError) throw pollError;
      
      // Delete all options and recreate them
      const { error: deleteError } = await supabase
        .from("poll_options")
        .delete()
        .eq("poll_id", poll.id);
        
      if (deleteError) throw deleteError;
      
      // Create new options
      const optionsToInsert = options
        .filter(opt => opt.trim() !== "")
        .map(opt => ({
          poll_id: poll.id,
          text: opt,
          votes: 0
        }));
        
      if (optionsToInsert.length > 0) {
        const { error: optionsError } = await supabase
          .from("poll_options")
          .insert(optionsToInsert);
          
        if (optionsError) throw optionsError;
      }
      
      return poll.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast({
        title: "Poll updated locally",
        description: "Note: Changes are only saved locally. To update on Strawpoll, delete and recreate the poll.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating poll",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question.",
        variant: "destructive",
      });
      return;
    }

    const validOptions = options.filter(opt => opt.trim() !== "");
    if (validOptions.length < 2) {
      toast({
        title: "Error",
        description: "Please add at least two options.",
        variant: "destructive",
      });
      return;
    }

    if (isEditing) {
      updatePollMutation.mutate();
    } else {
      createPollMutation.mutate();
    }
  };

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) return;
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const isPending = createPollMutation.isPending || updatePollMutation.isPending || isCreatingOnStrawpoll;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background dark:bg-black/70 backdrop-blur-sm border border-border/50">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-white/90">
            {isEditing ? "Edit Poll" : "Create New Poll on Strawpoll"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label 
              htmlFor="question" 
              className="text-foreground dark:text-white/80"
            >
              Question
            </Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question"
              className="bg-white/10 text-foreground dark:text-white/90 border-border/50 placeholder:text-muted-foreground/70"
              disabled={isPending}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-foreground dark:text-white/80">
              Options
            </Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="bg-white/10 text-foreground dark:text-white/90 border-border/50 placeholder:text-muted-foreground/70"
                  disabled={isPending}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveOption(index)}
                  disabled={options.length <= 1 || isPending}
                  className="text-destructive/70 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 border-primary/50 text-primary hover:bg-primary/10"
              onClick={handleAddOption}
              disabled={isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>

          {!isEditing && (
            <p className="text-xs text-muted-foreground">
              This poll will be created on Strawpoll.com with IP-based duplicate voting prevention.
            </p>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            onClick={() => onOpenChange(false)} 
            variant="secondary"
            className="mr-2 border border-gray-300 dark:border-gray-600 font-medium dark:text-white/90 text-gray-700 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? "Update" : "Create on Strawpoll"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PollDialog;
