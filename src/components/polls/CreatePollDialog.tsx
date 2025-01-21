import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ImageUploadField from "@/components/lower-thirds/form/ImageUploadField";

const CreatePollDialog = ({ onPollCreated }: { onPollCreated: () => void }) => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Question is required",
        variant: "destructive",
      });
      return;
    }

    if (options.filter(opt => opt.trim()).length < 2) {
      toast({
        title: "Error",
        description: "At least two options are required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // First create the poll in Supabase
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .insert({
          question,
          image_url: imageUrl,
          status: 'active'
        })
        .select()
        .single();

      if (pollError) throw pollError;

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(
          options
            .filter(opt => opt.trim())
            .map(text => ({
              poll_id: poll.id,
              text
            }))
        );

      if (optionsError) throw optionsError;

      // Create the poll in Streamlabs
      const { error: streamlabsError } = await supabase.functions.invoke('streamlabs-polls', {
        body: {
          action: 'create_poll',
          pollData: {
            question,
            options: options.filter(opt => opt.trim()).map(text => ({ text }))
          }
        }
      });

      if (streamlabsError) throw streamlabsError;

      toast({
        title: "Success",
        description: "Poll created successfully in both platforms",
      });
      
      setOpen(false);
      onPollCreated();
      
      setQuestion("");
      setImageUrl("");
      setOptions(["", ""]);
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Error",
        description: "Failed to create poll",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] dark:bg-black/90 dark:backdrop-blur-sm dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold dark:text-white">Create New Poll</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="question" className="dark:text-white/90">Question</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question"
              className="dark:bg-black/50 dark:text-white dark:border-white/10 dark:placeholder:text-white/50"
            />
          </div>
          
          <div className="grid gap-2">
            <ImageUploadField
              id="poll_image"
              label="Poll Image (Optional)"
              imageUrl={imageUrl}
              onImageUpload={setImageUrl}
            />
          </div>

          <div className="grid gap-2">
            <Label className="dark:text-white/90">Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="dark:bg-black/50 dark:text-white dark:border-white/10 dark:placeholder:text-white/50"
                />
                {index >= 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
                    className="dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {options.length < 4 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleAddOption}
                className="mt-2 dark:border-white/10 dark:text-white/90 dark:hover:bg-white/10"
              >
                Add Option
              </Button>
            )}
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={isCreating}
            className="dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            {isCreating ? 'Creating...' : 'Create Poll'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollDialog;