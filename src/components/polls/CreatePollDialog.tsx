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

    try {
      // Insert poll
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

      // Insert options
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

      toast({
        title: "Success",
        description: "Poll created successfully",
      });
      
      setOpen(false);
      onPollCreated();
      
      // Reset form
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Poll</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question"
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
            <Label>Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                {index >= 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
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
                className="mt-2"
              >
                Add Option
              </Button>
            )}
          </div>

          <Button onClick={handleSubmit}>Create Poll</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollDialog;