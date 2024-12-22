import { FritzContestant } from "@/integrations/supabase/types/tables/fritz";
import ContestantFrame from "./ContestantFrame";

interface ContestantListProps {
  contestants: FritzContestant[];
  onImageUpload: (position: number, file: File) => void;
  onNameChange: (position: number, name: string) => void;
  onScoreChange: (position: number, increment: boolean) => void;
  onClear: (position: number) => void;
  onImageClear: (position: number) => void;
}

const ContestantList = ({
  contestants,
  onImageUpload,
  onNameChange,
  onScoreChange,
  onClear,
  onImageClear,
}: ContestantListProps) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-center md:space-x-1">
      {[1, 2, 3].map((position) => {
        const contestant = contestants.find(c => c.position === position) || {
          id: `temp-${position}`,
          name: '',
          score: 0,
          image_url: null,
          position
        };

        return (
          <ContestantFrame
            key={position}
            imageUrl={contestant.image_url}
            name={contestant.name}
            score={contestant.score || 0}
            onImageUpload={(file) => onImageUpload(position, file)}
            onNameChange={(name) => onNameChange(position, name)}
            onScoreChange={(increment) => onScoreChange(position, increment)}
            onClear={() => onClear(position)}
            onImageClear={() => onImageClear(position)}
          />
        );
      })}
    </div>
  );
};

export default ContestantList;