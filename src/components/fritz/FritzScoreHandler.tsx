import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const FritzScoreHandler = () => {
  const { contestant, action } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const processingRef = useRef(false);

  useEffect(() => {
    const updateScore = async () => {
      if (processingRef.current || !contestant || !action) return;
      
      processingRef.current = true;
      console.log(`[FritzScoreHandler] Updating score for ${contestant}: ${action}`);

      const isIncrement = action === 'up';
      const currentYear = new Date().getFullYear();

      try {
        // Format contestant name to match database format
        const formattedName = contestant === 'c-lane' ? 'C-Lane' : 
          contestant === 'custom' ? 'Custom' :
          contestant.charAt(0).toUpperCase() + contestant.slice(1);

        // Get current contestant data
        const { data: contestantData, error: fetchError } = await supabase
          .from('fritz_contestants')
          .select('score, position')
          .eq('name', formattedName)
          .single();

        if (fetchError) {
          console.error('[FritzScoreHandler] Error fetching contestant:', fetchError);
          throw new Error('Contestant not found');
        }

        const newScore = (contestantData.score || 0) + (isIncrement ? 1 : -1);

        // Update contestant score
        const { error: updateError } = await supabase
          .from('fritz_contestants')
          .update({ score: newScore })
          .eq('name', formattedName);

        if (updateError) {
          console.error('[FritzScoreHandler] Error updating score:', updateError);
          throw new Error('Failed to update score');
        }

        // Get current yearly score
        const { data: yearlyData, error: yearlyFetchError } = await supabase
          .from('fritz_yearly_scores')
          .select('total_score')
          .eq('contestant_name', formattedName)
          .eq('year', currentYear)
          .single();

        if (yearlyFetchError) {
          console.error('[FritzScoreHandler] Error fetching yearly score:', yearlyFetchError);
          throw new Error('Failed to fetch yearly score');
        }

        const newYearlyScore = (yearlyData?.total_score || 0) + (isIncrement ? 1 : -1);

        // Update yearly score
        const { error: yearlyUpdateError } = await supabase
          .from('fritz_yearly_scores')
          .update({ total_score: newYearlyScore })
          .eq('contestant_name', formattedName)
          .eq('year', currentYear);

        if (yearlyUpdateError) {
          console.error('[FritzScoreHandler] Error updating yearly score:', yearlyUpdateError);
          throw new Error('Failed to update yearly score');
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
        processingRef.current = false;
        navigate('/fritz');
      }
    };

    updateScore();
  }, [contestant, action, navigate, toast]);

  return null;
};

export default FritzScoreHandler;