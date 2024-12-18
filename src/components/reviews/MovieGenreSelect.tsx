import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface MovieGenreSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const MovieGenreSelect = ({ value, onValueChange }: MovieGenreSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select genre" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="action">Action</SelectItem>
        <SelectItem value="comedy">Comedy</SelectItem>
        <SelectItem value="drama">Drama</SelectItem>
        <SelectItem value="horror">Horror</SelectItem>
        <SelectItem value="scifi">Sci-Fi</SelectItem>
        <SelectItem value="thriller">Thriller</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default MovieGenreSelect;