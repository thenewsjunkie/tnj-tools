
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type AIModel = "gpt-4o-mini" | "gpt-4o" | "gpt-4.5-preview";

const modelOptions: { value: AIModel; label: string }[] = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4.5-preview", label: "GPT-4.5 (Preview)" }
];

export const AskAI = () => {
  const [question, setQuestion] = useState("");
  const [selectedModel, setSelectedModel] = useState<AIModel>("gpt-4o-mini");
  const [aiResponse, setAIResponse] = useState<string | null>(null);
  
  const handleModelChange = (value: AIModel) => {
    setSelectedModel(value);
  };
  
  const { refetch, isLoading } = useQuery({
    queryKey: ["ai-response", question, selectedModel],
    queryFn: async () => {
      if (!question.trim()) return null;
      
      try {
        const { data, error } = await supabase.functions.invoke('ask-ai', {
          body: {
            model: selectedModel,
            prompt: question
          }
        });
        
        if (error) {
          toast({
            title: "Error",
            description: `Failed to get AI response: ${error.message}`,
            variant: "destructive"
          });
          throw new Error(`API Error: ${error.message}`);
        }
        
        const responseText = data.response;
        setAIResponse(responseText);
        return responseText;
      } catch (error) {
        console.error("Error fetching from AI service:", error);
        setAIResponse(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
        toast({
          title: "Error",
          description: `Error fetching from AI service: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
          variant: "destructive"
        });
        return null;
      }
    },
    enabled: false
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    try {
      await refetch();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };
  
  return (
    <div className="bg-black rounded-lg shadow border border-white/10">
      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Ask AI</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Model:</span>
            <Select
              value={selectedModel}
              onValueChange={(value) => handleModelChange(value as AIModel)}
            >
              <SelectTrigger className="w-[180px] h-8 text-xs bg-black/50">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask AI a question..."
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !question.trim()} 
                className="shrink-0"
              >
                {isLoading ? "Thinking..." : "Ask AI"}
              </Button>
            </div>
            
            {aiResponse && (
              <div className="mt-4 p-4 rounded-md bg-black/60 border border-white/10">
                <Textarea 
                  value={aiResponse}
                  readOnly
                  className="min-h-[200px] w-full border-0 bg-transparent focus-visible:ring-0 resize-none"
                />
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AskAI;
