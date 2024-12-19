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
      <SelectTrigger className="dark:bg-black/50 dark:text-white dark:border-white/10">
        <SelectValue placeholder="Select rating" />
      </SelectTrigger>
      <SelectContent className="dark:bg-black dark:text-white dark:border-white/10">
        {[1, 2, 3, 4, 5].map((rating) => (
          <SelectItem 
            key={rating} 
            value={rating.toString()}
            className="dark:text-white dark:focus:bg-white/10 dark:data-[highlighted]:bg-white/10"
          >
            {"★".repeat(rating)}{"☆".repeat(5-rating)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default RatingSelect;