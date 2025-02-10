
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const FritzScoreHandler = () => {
  const { contestant, action } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const updateScore = async () => {
      if (!contestant || !action) return;
      
      console.log(`[FritzScoreHandler] Updating score for ${contestant}: ${action}`);
      
      try {
        const { data, error } = await supabase.functions.invoke('update-fritz-score', {
          body: { 
            contestant, 
            increment: action === 'up',
            auth_token: 'fritz_tnj_2024' // Add static auth token
          }
        });

        if (error) throw error;
        
        toast({
          title: "Score Updated",
          description: `Score has been ${action === 'up' ? 'increased' : 'decreased'} by 1`,
        });

      } catch (error) {
        console.error('[FritzScoreHandler] Error:', error);
        toast({
          title: "Error",
          description: "Failed to update score",
          variant: "destructive",
        });
      } finally {
        navigate('/fritz');
      }
    };

    updateScore();
  }, [contestant, action, navigate, toast]);

  return null;
};

export default FritzScoreHandler;
