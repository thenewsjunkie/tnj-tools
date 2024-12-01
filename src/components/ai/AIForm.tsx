import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AIFormProps {
  onSubmit: (e: React.FormEvent, shouldImplement: boolean) => Promise<void>;
  isProcessing: boolean;
}

const AIForm = ({ onSubmit, isProcessing }: AIFormProps) => {
  const [targetPage, setTargetPage] = useState("");
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent, shouldImplement: boolean) => {
    e.preventDefault();
    onSubmit(e, shouldImplement);
  };

  return (
    <form className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="targetPage">Target Page</Label>
        <Input
          id="targetPage"
          name="targetPage"
          placeholder="/index, /admin, etc."
          value={targetPage}
          onChange={(e) => setTargetPage(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt">What changes would you like to make?</Label>
        <Textarea
          id="prompt"
          name="prompt"
          placeholder="Describe the changes you want to make..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px]"
          required
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          onClick={(e) => handleSubmit(e, false)}
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
          type="submit"
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