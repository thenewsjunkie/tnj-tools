import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface MovieGenreSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const MovieGenreSelect = ({ value, onValueChange }: MovieGenreSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="dark:bg-black/50 dark:text-white dark:border-white/10">
        <SelectValue placeholder="Select genre" />
      </SelectTrigger>
      <SelectContent className="dark:bg-black dark:text-white dark:border-white/10">
        <SelectItem value="action" className="dark:text-white dark:focus:bg-white/10 dark:data-[highlighted]:bg-white/10">Action</SelectItem>
        <SelectItem value="comedy" className="dark:text-white dark:focus:bg-white/10 dark:data-[highlighted]:bg-white/10">Comedy</SelectItem>
        <SelectItem value="drama" className="dark:text-white dark:focus:bg-white/10 dark:data-[highlighted]:bg-white/10">Drama</SelectItem>
        <SelectItem value="horror" className="dark:text-white dark:focus:bg-white/10 dark:data-[highlighted]:bg-white/10">Horror</SelectItem>
        <SelectItem value="scifi" className="dark:text-white dark:focus:bg-white/10 dark:data-[highlighted]:bg-white/10">Sci-Fi</SelectItem>
        <SelectItem value="thriller" className="dark:text-white dark:focus:bg-white/10 dark:data-[highlighted]:bg-white/10">Thriller</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default MovieGenreSelect;