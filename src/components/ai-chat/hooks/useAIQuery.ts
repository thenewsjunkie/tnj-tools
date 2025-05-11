
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type AIModel = "gpt-4o-mini" | "gpt-4o" | "gpt-4.5-preview";

export const useAIQuery = () => {
  const [question, setQuestion] = useState("");
  const [selectedModel, setSelectedModel] = useState<AIModel>("gpt-4o-mini");
  const [aiResponse, setAIResponse] = useState<string | null>(null);
  const [eli5Mode, setEli5Mode] = useState(false);

  const handleQuestionChange = (value: string) => {
    setQuestion(value);
  };

  const handleModelChange = (value: AIModel) => {
    setSelectedModel(value);
  };
  
  const handleEli5Change = (value: boolean) => {
    setEli5Mode(value);
  };

  const { refetch, isLoading } = useQuery({
    queryKey: ["ai-response", question, selectedModel, eli5Mode],
    queryFn: async () => {
      if (!question.trim()) return null;
      
      try {
        const { data, error } = await supabase.functions.invoke('ask-ai', {
          body: {
            model: selectedModel,
            prompt: question,
            eli5Mode: eli5Mode
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

  return {
    question,
    selectedModel,
    aiResponse,
    eli5Mode,
    isLoading,
    handleQuestionChange,
    handleModelChange,
    handleEli5Change,
    handleSubmit
  };
};
