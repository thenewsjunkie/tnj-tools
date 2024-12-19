import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReviewType } from "./types";

export interface ReviewTypeSelectProps {
  value: ReviewType;
  onValueChange: (value: ReviewType) => void;
}

const ReviewTypeSelect = ({ value, onValueChange }: ReviewTypeSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="dark:bg-black/50 dark:text-white dark:border-white/10">
        <SelectValue placeholder="Select type" />
      </SelectTrigger>
      <SelectContent className="dark:bg-black dark:text-white dark:border-white/10">
        <SelectItem value="movie" className="dark:text-white dark:focus:bg-white/10 dark:data-[highlighted]:bg-white/10">Movie</SelectItem>
        <SelectItem value="television" className="dark:text-white dark:focus:bg-white/10 dark:data-[highlighted]:bg-white/10">TV Show</SelectItem>
        <SelectItem value="food" className="dark:text-white dark:focus:bg-white/10 dark:data-[highlighted]:bg-white/10">Food</SelectItem>
        <SelectItem value="product" className="dark:text-white dark:focus:bg-white/10 dark:data-[highlighted]:bg-white/10">Product</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default ReviewTypeSelect;