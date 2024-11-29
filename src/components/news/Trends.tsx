import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TrendsProps {
  trends: string[];
}

const Trends = ({ trends }: TrendsProps) => {
  const [showAllTrends, setShowAllTrends] = useState(false);
  const visibleTrends = showAllTrends ? trends : trends.slice(0, 5);
  
  if (trends.length === 0) return null;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">Trending on Google</h3>
      <div className="space-y-2 text-left">
        {visibleTrends.map((trend, index) => (
          <p key={index} className="leading-relaxed">
            {trend}
          </p>
        ))}
      </div>
      {trends.length > 5 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAllTrends(!showAllTrends)}
          className="w-full flex items-center gap-2 text-muted-foreground hover:text-primary"
        >
          {showAllTrends ? (
            <>Show Less <ChevronUp className="h-4 w-4" /></>
          ) : (
            <>Show More <ChevronDown className="h-4 w-4" /></>
          )}
        </Button>
      )}
    </div>
  );
};

export default Trends;