import { useState } from "react";
import { Link } from "react-router-dom";
import { Computer, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";

interface Implementation {
  filename: string;
  code: string;
}

const AI = () => {
  const [prompt, setPrompt] = useState("");
  const [targetPage, setTargetPage] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [implementations, setImplementations] = useState<Implementation[]>([]);
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent, shouldImplement = false) => {
    e.preventDefault();
    setIsProcessing(true);
    setSuggestions("");
    setImplementations([]);

    try {
      const { data, error } = await supabase.functions.invoke('gpt-engineer', {
        body: { targetPage, prompt, implement: shouldImplement }
      });

      if (error) throw error;

      if (data.success) {
        setSuggestions(data.suggestions);
        if (shouldImplement && data.implementations) {
          setImplementations(data.implementations);
        }
        toast({
          title: shouldImplement ? "Implementation Complete" : "Analysis Complete",
          description: shouldImplement 
            ? "GPT Engineer has analyzed and provided implementation code."
            : "GPT Engineer has analyzed your request.",
        });
      } else {
        throw new Error('Failed to process request');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to process request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <nav className="flex justify-between items-center mb-8">
        <Link 
          to="/admin" 
          className="text-foreground hover:text-primary transition-colors"
        >
          ← Back to Admin
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <h1 className="text-foreground text-xl sm:text-2xl digital">GPT Engineer</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto space-y-8">
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

        {suggestions && (
          <div className="mt-8 space-y-6">
            <div className="p-6 bg-card rounded-lg border">
              <h2 className="text-lg font-semibold mb-4">Analysis Results</h2>
              <div className="whitespace-pre-wrap text-sm">
                {suggestions}
              </div>
            </div>

            {implementations.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Implementation Code</h2>
                {implementations.map((impl, index) => (
                  <div key={index} className="p-6 bg-card rounded-lg border">
                    <h3 className="text-md font-medium mb-4">{impl.filename}</h3>
                    <pre className="whitespace-pre-wrap text-sm overflow-x-auto bg-muted p-4 rounded">
                      {impl.code}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <h2 className="font-medium mb-2">How to use:</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Enter the target page URL (e.g., /index, /admin)</li>
            <li>Describe the changes you want to make</li>
            <li>Click "Analyze Changes" to review suggestions</li>
            <li>Or click "Analyze & Implement" to get implementation code</li>
            <li>Copy the implementation code for each file and apply the changes</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AI;