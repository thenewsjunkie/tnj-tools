import { useState } from "react";
import Alerts from "@/components/Alerts";
import AIForm from "@/components/ai/AIForm";
import ImplementationCard from "@/components/ai/ImplementationCard";
import VersionHistory from "@/components/ai/VersionHistory";
import { supabase } from "@/integrations/supabase/client";

const AI = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImplementation, setCurrentImplementation] = useState({
    filename: "",
    code: "",
    implementation_id: "",
  });

  const handleSubmit = async (targetPage: string, prompt: string, shouldImplement: boolean) => {
    try {
      setIsProcessing(true);
      
      // Insert the code implementation into the database
      const { data, error } = await supabase
        .from('code_implementations')
        .insert({
          filename: targetPage,
          code: "", // This will be populated by the AI
          target_page: targetPage,
          prompt: prompt,
          status: shouldImplement ? 'pending' : 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setCurrentImplementation({
          filename: data.filename,
          code: data.code,
          implementation_id: data.id
        });
      }
    } catch (error) {
      console.error('Error submitting code implementation:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <AIForm 
        onSubmit={handleSubmit}
        isProcessing={isProcessing}
      />
      <ImplementationCard 
        implementation={currentImplementation}
      />
      <VersionHistory />
      <Alerts />
    </div>
  );
};

export default AI;