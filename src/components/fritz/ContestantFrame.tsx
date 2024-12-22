import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ScoreControls from "./ScoreControls";
import ClearButton from "./ClearButton";

interface ContestantFrameProps {
  imageUrl: string | null;
  name: string | null;
  score: number;
  onImageUpload: (file: File) => void;
  onNameChange: (name: string) => void;
  onScoreChange: (increment: boolean) => void;
  onClear: () => void;
  onImageClear: () => void;
}

const ContestantFrame = ({
  imageUrl,
  name,
  score,
  onImageUpload,
  onNameChange,
  onScoreChange,
  onClear,
  onImageClear,
}: ContestantFrameProps) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <ScoreControls score={score} onScoreChange={onScoreChange} />
      
      <div className="relative w-64 h-64 border-4 border-white/20 rounded-lg overflow-hidden">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={name || ''}
              className="w-full h-full object-cover"
            />
            <ClearButton onClick={onImageClear} />
          </>
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
        className="w-full max-w-[256px] bg-black text-white placeholder:text-white/50 text-center"
      />

      <Button
        variant="ghost"
        onClick={onClear}
        className="text-black hover:bg-black/10"
      >
        Clear
      </Button>
    </div>
  );
};

export default ContestantFrame;