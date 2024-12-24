import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const FritzScoreHandler = () => {
  const { contestant, action } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const updateScore = async () => {
      if (!contestant || !action) return;
      
      console.log(`[FritzScoreHandler] Updating score for ${contestant}: ${action}`);

      const isIncrement = action === 'up';
      
      try {
        // Format contestant name to match database format
        const formattedName = contestant === 'c-lane' ? 'C-Lane' : 
          contestant === 'custom' ? 'Custom' :
          contestant.charAt(0).toUpperCase() + contestant.slice(1);

        // Get current contestant data for version
        const { data: contestantData, error: fetchError } = await supabase
          .from('fritz_contestants')
          .select('version')
          .eq('name', formattedName)
          .single();

        if (fetchError) {
          console.error('[FritzScoreHandler] Error fetching contestant:', fetchError);
          throw new Error('Contestant not found');
        }

        const { data, error } = await supabase
          .rpc('update_contestant_score', {
            p_contestant_name: formattedName,
            p_increment: isIncrement,
            p_current_version: contestantData.version
          });

        if (error) throw error;

        if (!data.success) {
          toast({
            title: "Score Changed",
            description: "The score was just updated by someone else. Please try again.",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Score Updated",
          description: `${formattedName}'s score has been ${isIncrement ? 'increased' : 'decreased'} by 1`,
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