import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReviewType } from "./types";

export interface ReviewTypeSelectProps {
  value: ReviewType;
  onValueChange: (value: ReviewType) => void;
}

const ReviewTypeSelect = ({ value, onValueChange }: ReviewTypeSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="movie">Movie</SelectItem>
        <SelectItem value="television">TV Show</SelectItem>
        <SelectItem value="food">Food</SelectItem>
        <SelectItem value="product">Product</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default ReviewTypeSelect;