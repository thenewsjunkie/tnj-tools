import { FritzContestant } from "@/integrations/supabase/types/tables/fritz";
import { useContestantScore } from "./useContestantScore";
import { useContestantClear } from "./useContestantClear";
import { useContestantUpdate } from "./useContestantUpdate";

export const useContestantManagement = (
  contestants: FritzContestant[],
  setContestants: (contestants: FritzContestant[]) => void
) => {
  const { updateScore } = useContestantScore(contestants, setContestants);
  const { clearContestant, clearContestantImage } = useContestantClear(contestants, setContestants);
  const { handleImageUpload, updateContestantName } = useContestantUpdate(contestants, setContestants);

  return {
    updateScore,
    clearContestant,
    clearContestantImage,
    handleImageUpload,
    updateContestantName
  };
};