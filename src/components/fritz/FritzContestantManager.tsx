import type { FritzContestant } from "@/integrations/supabase/types/tables/fritz";
import ContestantList from "./ContestantList";
import { useContestantManagement } from "./hooks/useContestantManagement";

interface FritzContestantManagerProps {
  contestants: FritzContestant[];
  setContestants: (contestants: FritzContestant[]) => void;
}

const FritzContestantManager = ({ contestants, setContestants }: FritzContestantManagerProps) => {
  const {
    updateScore,
    clearContestant,
    clearContestantImage,
    handleImageUpload,
    updateContestantName
  } = useContestantManagement(contestants, setContestants);

  return (
    <ContestantList
      contestants={contestants}
      onImageUpload={handleImageUpload}
      onNameChange={updateContestantName}
      onScoreChange={updateScore}
      onClear={clearContestant}
      onImageClear={clearContestantImage}
    />
  );
};

export default FritzContestantManager;