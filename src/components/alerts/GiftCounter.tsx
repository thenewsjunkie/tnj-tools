import { useEffect, useState } from "react";

interface GiftCounterProps {
  targetCount: number;
  animationSpeed?: number;
  textColor?: string;
  countColor?: string;
}

const GiftCounter = ({ 
  targetCount, 
  animationSpeed = 100,
  textColor = "#FFFFFF",
  countColor = "#4CDBC4"
}: GiftCounterProps) => {
  const [currentCount, setCurrentCount] = useState(0);

  useEffect(() => {
    if (currentCount < targetCount) {
      const timeout = setTimeout(() => {
        setCurrentCount(prev => Math.min(prev + 1, targetCount));
      }, animationSpeed);
      
      return () => clearTimeout(timeout);
    }
  }, [currentCount, targetCount, animationSpeed]);

  return (
    <div 
      className="text-center font-bold text-4xl"
      style={{ color: textColor }}
    >
      <span>Gifted </span>
      <span style={{ color: countColor }} className="animate-pulse">
        {currentCount}
      </span>
      <span> Subscriptions!</span>
    </div>
  );
};

export default GiftCounter;