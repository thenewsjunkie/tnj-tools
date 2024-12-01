import { useState } from "react";
import { Link } from "react-router-dom";
import { Computer, History } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import AIForm from "@/components/ai/AIForm";
import ImplementationCard from "@/components/ai/ImplementationCard";
import VersionHistory from "@/components/ai/VersionHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Implementation {
  filename: string;
  code: string;
  implementation_id: string;
}

const AI = () => {
  const [suggestions, setSuggestions] = useState("");
  const [implementations, setImplementations] = useState<Implementation[]>([]);
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (targetPage: string, prompt: string, shouldImplement: boolean) => {
    setIsProcessing(true);
    setSuggestions("");
    setImplementations([]);

    try {
      console.log('Submitting request:', { targetPage, prompt, shouldImplement });

      const { data, error } = await supabase.functions.invoke('gpt-engineer', {
        body: { targetPage, prompt, implement: shouldImplement }
      });

      console.log('Response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.success) {
        setSuggestions(data.suggestions);
        if (shouldImplement && data.implementations) {
          setImplementations(data.implementations);
          
          // Store version information
          if (data.commitInfo) {
            const { error: versionError } = await supabase
              .from('code_versions')
              .insert({
                commit_hash: data.commitInfo.hash,
                commit_message: data.commitInfo.message,
                changes: data.implementations,
                prompt,
                branch_name: data.commitInfo.branch
              });

            if (versionError) {
              console.error('Version storage error:', versionError);
              throw versionError;
            }
          }
        }
        
        toast({
          title: shouldImplement ? "Implementation Complete" : "Analysis Complete",
          description: shouldImplement 
            ? "Changes have been committed to GitHub. You can review them in the Version History tab."
            : "GPT Engineer has analyzed your request.",
        });
      } else {
        console.error('Invalid response data:', data);
        throw new Error('Failed to process request: Invalid response data');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process request. Please try again.",
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
        <Tabs defaultValue="engineer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="engineer" className="flex items-center gap-2">
              <Computer className="h-4 w-4" />
              Engineer
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Version History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="engineer" className="space-y-8">
            <AIForm onSubmit={handleSubmit} isProcessing={isProcessing} />

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
                      <ImplementationCard key={index} implementation={impl} />
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
                <li>Or click "Analyze & Implement" to commit changes to GitHub</li>
                <li>Review changes in the Version History tab</li>
                <li>Roll back to previous versions if needed</li>
              </ol>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <VersionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AI;