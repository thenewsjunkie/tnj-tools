import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ScoreControls from "./ScoreControls";
import ClearButton from "./ClearButton";
import { useTheme } from "@/components/theme/ThemeProvider";

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
  const { theme } = useTheme();
  
  return (
    <div className="flex flex-col items-center space-y-4 w-full md:w-auto">
      <div className="relative w-full md:w-64 bg-black/80 rounded-lg overflow-hidden backdrop-blur-sm p-4">
        <ScoreControls score={score} onScoreChange={onScoreChange} />
        
        <div className="relative w-full h-64 border-2 border-white/20 rounded-lg overflow-hidden mt-4">
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

        <div className="mt-4">
          <Input
            type="text"
            value={name || ''}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter name"
            className={`w-full text-center border-white/10 dark:!bg-black/50 uppercase tracking-wider ${
              theme === 'dark' 
                ? 'text-white placeholder:text-white/50' 
                : 'text-black placeholder:text-black/50'
            }`}
          />
        </div>

        <Button
          variant="ghost"
          onClick={onClear}
          className="mt-4 w-full hover:bg-white/10 text-white"
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default ContestantFrame;