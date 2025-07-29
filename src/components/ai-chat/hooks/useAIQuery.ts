
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type AIModel = "gpt-4o-mini" | "gpt-4o" | "gpt-4.5-preview";

export const useAIQuery = () => {
  const [question, setQuestion] = useState("");
  const [selectedModel, setSelectedModel] = useState<AIModel>("gpt-4o");
  const [aiResponse, setAIResponse] = useState<string | null>(null);
  const [eli5Mode, setEli5Mode] = useState(false);
  const [detailedMode, setDetailedMode] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const handleQuestionChange = (value: string) => {
    setQuestion(value);
  };

  const handleModelChange = (value: AIModel) => {
    setSelectedModel(value);
  };
  
  const handleEli5Change = (value: boolean) => {
    setEli5Mode(value);
    if (value && detailedMode) {
      setDetailedMode(false);
    }
  };

  const handleDetailedChange = (value: boolean) => {
    setDetailedMode(value);
    if (value && eli5Mode) {
      setEli5Mode(false);
    }
  };

  const { refetch, isLoading } = useQuery({
    queryKey: ["ai-response", question, selectedModel, eli5Mode, detailedMode],
    queryFn: async () => {
      if (!question.trim()) return null;
      
      try {
        const { data, error } = await supabase.functions.invoke('ask-ai', {
          body: {
            model: selectedModel,
            prompt: question,
            eli5Mode: eli5Mode,
            detailedMode: detailedMode
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
        
        // Save the conversation to the database
        const { data: conversationData, error: conversationError } = await supabase
          .from('audio_conversations')
          .insert({
            question_text: question.trim(),
            answer_text: responseText,
            status: 'completed',
            conversation_state: 'pending',
            is_detailed: detailedMode,
            is_simple: eli5Mode
          })
          .select()
          .single();
        
        if (conversationError) {
          console.error("Error saving conversation:", conversationError);
        } else if (conversationData) {
          setConversationId(conversationData.id);
          console.log("Conversation saved with ID:", conversationData.id);
        }
        
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
      // Reset the AI response and conversation ID before fetching a new one
      setAIResponse(null);
      setConversationId(null);
      await refetch();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  // This function will be used to display the conversation in OBS
  const displayInOBS = async () => {
    if (!conversationId) {
      console.error("No conversation ID to display");
      toast({
        title: "Error",
        description: "Failed to display in OBS - missing conversation ID",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Use the mark_as_displayed function to set this conversation as displaying
      const { error } = await supabase.rpc('mark_as_displayed', {
        conversation_id: conversationId
      });
        
      if (error) {
        console.error('Error updating conversation state:', error);
        toast({
          title: "Error",
          description: "Failed to display in OBS",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Success",
        description: "Conversation is now showing in OBS",
      });
      return true;
    } catch (error) {
      console.error("Error displaying in OBS:", error);
      toast({
        title: "Error",
        description: "Failed to display in OBS",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    question,
    selectedModel,
    aiResponse,
    eli5Mode,
    detailedMode,
    isLoading,
    conversationId,
    handleQuestionChange,
    handleModelChange,
    handleEli5Change,
    handleDetailedChange,
    handleSubmit,
    displayInOBS
  };
};
