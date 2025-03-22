
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";

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
      // First create the poll
      const { data: pollData, error: pollError } = await supabase
        .from("polls")
        .insert([{ question, status: "draft" }])
        .select();
        
      if (pollError) throw pollError;
      
      const pollId = pollData[0].id;
      
      // Then create the options
      const optionsToInsert = options
        .filter(opt => opt.trim() !== "")
        .map(opt => ({
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
      queryClient.invalidateQueries({ queryKey: ["polls"] });
      toast({
        title: "Poll created",
        description: "The poll has been created successfully.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
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
      
      // Update the poll question
      const { error: pollError } = await supabase
        .from("polls")
        .update({ question })
        .eq("id", poll.id);
        
      if (pollError) throw pollError;
      
      // Get existing options
      const existingOptions = poll.poll_options.map((opt: any) => ({
        id: opt.id,
        text: opt.text,
      }));
      
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
        title: "Poll updated",
        description: "The poll has been updated successfully.",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Poll" : "Create New Poll"}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveOption(index)}
                  disabled={options.length <= 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleAddOption}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={createPollMutation.isPending || updatePollMutation.isPending}>
            {isEditing ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PollDialog;
