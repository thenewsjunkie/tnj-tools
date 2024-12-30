import { useEffect, useState } from "react";

interface GiftCounterProps {
  targetCount: number;
  animationSpeed?: number;
  textColor?: string;
  countColor?: string;
  fontSize?: number;
}

const GiftCounter = ({ 
  targetCount, 
  animationSpeed = 100,
  textColor = "#FFFFFF",
  countColor = "#4CDBC4",
  fontSize = 36
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
      className="alert-message-font"
      style={{ 
        fontSize: `${fontSize}px`,
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        color: countColor
      }}
    >
      {currentCount}
    </div>
  );
};

export default GiftCounter;