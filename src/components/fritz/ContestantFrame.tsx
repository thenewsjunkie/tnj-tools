import { Input } from "@/components/ui/input";
import ScoreControls from "./ScoreControls";

interface ContestantFrameProps {
  imageUrl: string | null;
  name: string | null;
  score: number;
  onImageUpload: (file: File) => void;
  onNameChange: (name: string) => void;
  onScoreChange: (increment: boolean) => void;
}

const ContestantFrame = ({
  imageUrl,
  name,
  score,
  onImageUpload,
  onNameChange,
  onScoreChange,
}: ContestantFrameProps) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <ScoreControls score={score} onScoreChange={onScoreChange} />
      
      <div className="relative w-64 h-64 border-4 border-white/20 rounded-lg overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name || ''}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-black/20 flex items-center justify-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImageUpload(file);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <span className="text-white/50">Click to upload image</span>
          </div>
        )}
      </div>

      <Input
        type="text"
        value={name || ''}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Enter name"
        className="bg-black/20 border-white/20 text-white placeholder:text-white/50 text-center"
      />
    </div>
  );
};

export default ContestantFrame;