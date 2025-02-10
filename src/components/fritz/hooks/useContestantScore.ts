
import { supabase } from "@/integrations/supabase/client";
import { FritzContestant } from "@/integrations/supabase/types/tables/fritz";
import { useToast } from "@/components/ui/use-toast";

interface UpdateScoreResult {
  success: boolean;
  new_score: number;
  new_version: number;
}

export const useContestantScore = (
  contestants: FritzContestant[],
  setContestants: (contestants: FritzContestant[]) => void
) => {
  const { toast } = useToast();

  const updateScore = async (position: number, increment: boolean) => {
    const contestant = contestants.find(c => c.position === position);
    if (!contestant || !contestant.name) return;

    const { data, error } = await supabase
      .rpc('update_contestant_score', {
        p_contestant_name: contestant.name,
        p_increment: increment,
        p_current_version: contestant.version,
        p_auth_token: 'fritz_tnj_2024' // Add static auth token
      });

    if (error) {
      console.error('[useContestantScore] Error updating score:', error);
      toast({
        title: "Error",
        description: "Failed to update score",
        variant: "destructive",
      });
      return;
    }

    // Get first row of result
    const result = data[0] as UpdateScoreResult;

    if (!result.success) {
      // Score was updated by someone else, just update local state
      // No toast notification needed
      return;
    }

    // Update local state with new score and version
    setContestants(contestants.map(c => 
      c.position === position 
        ? { ...c, score: result.new_score, version: result.new_version }
        : c
    ));
  };

  return { updateScore };
};
