import { useNavigate } from 'react-router-dom';
import { FritzContestant } from "@/integrations/supabase/types/tables/fritz";

export const useContestantScore = (
  contestants: FritzContestant[],
  setContestants: (contestants: FritzContestant[]) => void
) => {
  const navigate = useNavigate();

  const updateScore = async (position: number, increment: boolean) => {
    const contestant = contestants.find(c => c.position === position);
    if (!contestant || !contestant.name) return;

    // Convert contestant name to URL-friendly format
    const urlName = contestant.name === 'C-Lane' ? 'c-lane' : 
                    contestant.name === 'Custom' ? 'custom' :
                    contestant.name.toLowerCase();

    // Navigate to score handler route
    navigate(`/fritz/${urlName}/${increment ? 'up' : 'down'}`);
  };

  return { updateScore };
};