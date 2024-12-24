import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const FritzScoreHandler = () => {
  const { contestant, action } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const updateScore = async () => {
      if (!contestant || !action) return;
      
      console.log(`[FritzScoreHandler] Updating score for ${contestant}: ${action}`);
      
      try {
        const response = await fetch(`/fritz/${contestant}/${action}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to update score');
        }

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