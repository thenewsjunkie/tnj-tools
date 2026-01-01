import { format, addDays, subDays, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface DateSelectorProps {
  date: Date;
  onChange: (date: Date) => void;
}

const DateSelector = ({ date, onChange }: DateSelectorProps) => {
  const handlePrevious = () => {
    onChange(subDays(date, 1));
  };

  const handleNext = () => {
    onChange(addDays(date, 1));
  };

  const handleToday = () => {
    onChange(new Date());
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={handlePrevious}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-1.5 text-sm font-medium min-w-[140px] justify-center">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span>{format(date, "MMM d, yyyy")}</span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={handleNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {!isToday(date) && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={handleToday}
        >
          Today
        </Button>
      )}
    </div>
  );
};

export default DateSelector;
