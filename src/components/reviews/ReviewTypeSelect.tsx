import { Tv, Film, Utensils, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReviewTypeSelectProps {
  onValueChange: (value: "television" | "movie" | "food" | "product") => void;
}

const ReviewTypeSelect = ({ onValueChange }: ReviewTypeSelectProps) => {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger className="bg-white dark:bg-white dark:text-black">
        <SelectValue placeholder="Select review type" />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-white">
        <SelectItem value="television" className="text-black dark:text-black">
          <div className="flex items-center gap-2">
            <Tv className="h-4 w-4" />
            <span>Television Series</span>
          </div>
        </SelectItem>
        <SelectItem value="movie" className="text-black dark:text-black">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4" />
            <span>Movie</span>
          </div>
        </SelectItem>
        <SelectItem value="food" className="text-black dark:text-black">
          <div className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            <span>Food</span>
          </div>
        </SelectItem>
        <SelectItem value="product" className="text-black dark:text-black">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>Product</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default ReviewTypeSelect;