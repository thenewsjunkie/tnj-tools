import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AIFormProps {
  onSubmit: (targetPage: string, prompt: string, shouldImplement: boolean) => Promise<void>;
  isProcessing: boolean;
}

const AIForm = ({ onSubmit, isProcessing }: AIFormProps) => {
  const [targetPage, setTargetPage] = useState("");
  const [prompt, setPrompt] = useState("");

  const handleSubmit = async (e: React.FormEvent, shouldImplement: boolean) => {
    e.preventDefault();
    await onSubmit(targetPage, prompt, shouldImplement);
  };

  return (
    <form className="space-y-6" onSubmit={(e) => handleSubmit(e, false)}>
      <div className="space-y-2">
        <Label htmlFor="targetPage">Target Page</Label>
        <Input
          id="targetPage"
          value={targetPage}
          onChange={(e) => setTargetPage(e.target.value)}
          placeholder="/index, /admin, etc."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt">What changes would you like to make?</Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the changes you want to make..."
          className="min-h-[100px]"
          required
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Analyze Changes"
          )}
        </Button>
        <Button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={isProcessing}
          variant="secondary"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Analyze & Implement"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AIForm;