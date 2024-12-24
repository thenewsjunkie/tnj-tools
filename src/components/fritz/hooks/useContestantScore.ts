import { supabase } from "@/integrations/supabase/client";
import { FritzContestant } from "@/integrations/supabase/types/tables/fritz";

export const useContestantScore = (
  contestants: FritzContestant[],
  setContestants: (contestants: FritzContestant[]) => void
) => {
  const currentYear = new Date().getFullYear();

  const updateScore = async (position: number, increment: boolean) => {
    const contestant = contestants.find(c => c.position === position);
    if (!contestant || !contestant.name) return;

    const newScore = increment ? (contestant.score || 0) + 1 : (contestant.score || 0) - 1;
    
    const { error } = await supabase
      .from('fritz_contestants')
      .update({ score: newScore })
      .eq('position', position);

    if (error) {
      console.error('Error updating score:', error);
      return;
    }

    // Update yearly score
    const { data: yearlyScore } = await supabase
      .from('fritz_yearly_scores')
      .select('total_score')
      .eq('contestant_name', contestant.name)
      .eq('year', currentYear)
      .single();

    if (yearlyScore) {
      const newYearlyScore = yearlyScore.total_score + (increment ? 1 : -1);
      await supabase
        .from('fritz_yearly_scores')
        .update({ total_score: newYearlyScore })
        .eq('contestant_name', contestant.name)
        .eq('year', currentYear);
    }
  };

  return { updateScore };
};