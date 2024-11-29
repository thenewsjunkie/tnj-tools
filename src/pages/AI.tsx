import { useState } from "react";
import { Link } from "react-router-dom";
import { Computer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const AI = () => {
  const [prompt, setPrompt] = useState("");
  const [targetPage, setTargetPage] = useState("");
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Here we would integrate with GPT Engineer
      // For now, show a toast message
      toast({
        title: "Feature Coming Soon",
        description: "GPT Engineer integration is under development.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process request",
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

      <div className="max-w-2xl mx-auto space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <Button 
            type="submit" 
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Generate Changes"}
          </Button>
        </form>

        <div className="text-sm text-muted-foreground">
          <h2 className="font-medium mb-2">How to use:</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Enter the target page URL (e.g., /index, /admin)</li>
            <li>Describe the changes you want to make</li>
            <li>Click "Generate Changes" to process your request</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AI;