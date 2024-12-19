import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface RatingSelectProps {
  value: number | undefined;
  onValueChange: (value: number) => void;
}

const RatingSelect = ({ value, onValueChange }: RatingSelectProps) => {
  return (
    <Select 
      value={value?.toString() || ""} 
      onValueChange={(val) => onValueChange(parseInt(val, 10))}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select rating" />
      </SelectTrigger>
      <SelectContent>
        {[1, 2, 3, 4, 5].map((rating) => (
          <SelectItem key={rating} value={rating.toString()}>
            {"★".repeat(rating)}{"☆".repeat(5-rating)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default RatingSelect;