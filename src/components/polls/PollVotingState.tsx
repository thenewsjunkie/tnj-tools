
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PollOption } from "./types";

interface PollVotingStateProps {
  options: PollOption[];
  selectedOption: string | null;
  setSelectedOption: (value: string) => void;
  handleVote: () => Promise<void>;
  theme: "light" | "dark";
  textColor: string;
}

const PollVotingState: React.FC<PollVotingStateProps> = ({
  options,
  selectedOption,
  setSelectedOption,
  handleVote,
  theme,
  textColor
}) => {
  // Sort the options based on display_order to maintain original order
  const sortedOptions = [...options].sort((a, b) => a.display_order - b.display_order);

  // Update the radio button styling
  const radioItemClassNames = cn(
    "aspect-square h-4 w-4 rounded-full border",
    theme === "light" 
      ? "border-gray-300 text-neon-red ring-offset-white focus-visible:ring-neon-red" 
      : "border-primary text-primary ring-offset-background focus-visible:ring-ring"
  );

  return (
    <>
      <CardContent>
        <RadioGroup value={selectedOption || undefined} onValueChange={setSelectedOption}>
          {sortedOptions.map((option) => (
            <div className="flex items-center space-x-2 mb-3" key={option.id}>
              <RadioGroupItem 
                value={option.id} 
                id={option.id} 
                className={radioItemClassNames}
                style={{
                  '--tw-ring-color': theme === 'light' ? '#f21516' : 'hsl(var(--ring))',
                } as React.CSSProperties}
              />
              <Label htmlFor={option.id} className={`cursor-pointer ${textColor}`}>{option.text}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleVote} 
          disabled={!selectedOption}
          className="w-full"
          variant={theme === "light" ? "default" : "default"}
        >
          Vote
        </Button>
      </CardFooter>
    </>
  );
};

export default PollVotingState;
