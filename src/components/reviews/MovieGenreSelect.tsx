import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skull, Zap, Rocket, Heart, Mountain, Film } from "lucide-react";

interface MovieGenreSelectProps {
  onValueChange: (value: string) => void;
}

const MovieGenreSelect = ({ onValueChange }: MovieGenreSelectProps) => {
  const genreOptions = [
    { value: 'Horror', icon: Skull },
    { value: 'Action', icon: Zap },
    { value: 'Sci Fi', icon: Rocket },
    { value: 'Romantic Comedy', icon: Heart },
    { value: 'Adventure', icon: Mountain },
    { value: 'Comedy', icon: Heart },
    { value: 'Drama', icon: Film },
    { value: 'Animation', icon: Film },
    { value: 'Thriller', icon: Skull },
    { value: 'Other', icon: Film },
  ];

  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger className="bg-white dark:bg-white dark:text-black">
        <SelectValue placeholder="Select movie genre" />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-white">
        {genreOptions.map(({ value, icon: Icon }) => (
          <SelectItem key={value} value={value} className="text-black dark:text-black">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span>{value}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MovieGenreSelect;