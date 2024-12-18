import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RatingSelectProps {
  value?: number;
  onChange: (value: number) => void;
}

const RatingSelect = ({ value, onChange }: RatingSelectProps) => {
  return (
    <Select value={value?.toString()} onValueChange={(value) => onChange(parseInt(value))}>
      <SelectTrigger className="bg-white dark:bg-white dark:text-black">
        <SelectValue placeholder="Rating" />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-white">
        {[1, 2, 3, 4, 5].map((star) => (
          <SelectItem key={star} value={star.toString()} className="text-black dark:text-black">
            {"★".repeat(star)}{"☆".repeat(5-star)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default RatingSelect;