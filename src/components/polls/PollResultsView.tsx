
import React from "react";
import { Progress } from "@/components/ui/progress";
import { CardContent } from "@/components/ui/card";
import { PollOption } from "./types";

interface PollResultsViewProps {
  options: PollOption[];
  totalVotes: number;
  primaryColor: string;
  mutedBgColor: string;
  textColor: string;
  mutedTextColor: string;
}

const PollResultsView: React.FC<PollResultsViewProps> = ({
  options,
  totalVotes,
  primaryColor,
  mutedBgColor,
  textColor,
  mutedTextColor
}) => {
  // Sort the options based on display_order to maintain original order
  const sortedOptions = [...options].sort((a, b) => a.display_order - b.display_order);

  return (
    <CardContent>
      <div className="space-y-3">
        {sortedOptions.map((option) => {
          const percentage = totalVotes ? Math.round((option.votes / totalVotes) * 100) : 0;
          
          return (
            <div key={option.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className={textColor}>{option.text}</span>
                <span className={`font-medium ${textColor}`}>{percentage}%</span>
              </div>
              <Progress 
                value={percentage} 
                className={mutedBgColor}
                indicatorClassName={primaryColor}
              />
              <p className={`text-xs ${mutedTextColor}`}>{option.votes} votes</p>
            </div>
          );
        })}
        <p className={`text-sm ${mutedTextColor} pt-2`}>
          Total votes: {totalVotes}
        </p>
      </div>
    </CardContent>
  );
};

export default PollResultsView;
