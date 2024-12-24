import { supabase } from "@/integrations/supabase/client";
import { FritzContestant } from "@/integrations/supabase/types/tables/fritz";
import { useToast } from "@/components/ui/use-toast";

interface ScoreUpdateResult {
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
        p_current_version: contestant.version
      });

    if (error) {
      console.error('Error updating score:', error);
      toast({
        title: "Error",
        description: "Failed to update score. Please try again.",
        variant: "destructive"
      });
      return;
    }

    // Get first row of the result since it's returned as an array
    const result = data[0] as ScoreUpdateResult;

    if (!result.success) {
      console.log('Score was updated by another user, refreshing...');
      const { data: refreshedData } = await supabase
        .from('fritz_contestants')
        .select('*')
        .order('position');
      
      if (refreshedData) {
        setContestants(refreshedData);
      }
      
      toast({
        title: "Score Changed",
        description: "The score was just updated by someone else. The display has been refreshed.",
      });
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