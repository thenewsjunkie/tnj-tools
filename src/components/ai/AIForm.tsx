import { useState } from "react";
import { Computer, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AIFormProps {
  onSubmit: (e: React.FormEvent, shouldImplement: boolean) => Promise<void>;
  isProcessing: boolean;
}

const AIForm = ({ onSubmit, isProcessing }: AIFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [targetPage, setTargetPage] = useState("");

  const handleSubmit = async (e: React.FormEvent, shouldImplement: boolean) => {
    e.preventDefault();
    await onSubmit(e, shouldImplement);
    // Don't clear the form on error
    if (!isProcessing) {
      setPrompt("");
      setTargetPage("");
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="targetPage" className="block text-sm font-medium">
          Target Page
        </label>
        <Input
          id="targetPage"
          placeholder="e.g., /index, /admin, etc."
          value={targetPage}
          onChange={(e) => setTargetPage(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="prompt" className="block text-sm font-medium">
          What changes would you like to make?
        </label>
        <Textarea
          id="prompt"
          placeholder="Describe the changes you want to make..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="h-32"
          required
        />
      </div>

      <div className="flex gap-4">
        <Button 
          type="submit" 
          className="flex-1"
          disabled={isProcessing}
        >
          <Computer className="w-4 h-4 mr-2" />
          {isProcessing ? "Processing..." : "Analyze Changes"}
        </Button>
        <Button 
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          className="flex-1"
          disabled={isProcessing}
          variant="secondary"
        >
          <Code2 className="w-4 h-4 mr-2" />
          {isProcessing ? "Processing..." : "Analyze & Implement"}
        </Button>
      </div>
    </form>
  );
};

export default AIForm;