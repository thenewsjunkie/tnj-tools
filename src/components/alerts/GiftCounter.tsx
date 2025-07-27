import { useEffect, useState } from "react";

interface GiftCounterProps {
  targetCount: number;
  animationSpeed?: number;
  textColor?: string;
  countColor?: string;
  fontSize?: number;
  onCountComplete?: () => void;
}

const GiftCounter = ({ 
  targetCount, 
  animationSpeed = 100,
  textColor = "#FFFFFF",
  countColor = "#4CDBC4",
  fontSize = 36,
  onCountComplete
}: GiftCounterProps) => {
  const [currentCount, setCurrentCount] = useState(0);

  useEffect(() => {
    if (currentCount < targetCount) {
      let currentSpeed = animationSpeed;
      
      if (currentCount > 50) {
        currentSpeed = animationSpeed / 3;
      } else if (currentCount > 10) {
        currentSpeed = animationSpeed / 1.5;
      }

      const timeout = setTimeout(() => {
        let increment = 1;
        if (targetCount > 100 && currentCount > 50) {
          increment = 3;
        } else if (targetCount > 50 && currentCount > 10) {
          increment = 2;
        }

        const nextCount = Math.min(currentCount + increment, targetCount);
        setCurrentCount(nextCount);
      }, currentSpeed);
      
      return () => clearTimeout(timeout);
    } else if (currentCount === targetCount) {
      onCountComplete?.();
    }
  }, [currentCount, targetCount, animationSpeed, onCountComplete]);

  return (
    <div 
      className="alert-message-font"
      style={{ 
        fontSize: `${fontSize}px`,
        textShadow: '3px 3px 0px rgba(0, 0, 0, 1), -1px -1px 0px rgba(0, 0, 0, 1), 1px -1px 0px rgba(0, 0, 0, 1), -1px 1px 0px rgba(0, 0, 0, 1), 4px 4px 8px rgba(0, 0, 0, 0.8)',
        WebkitTextStroke: '1px rgba(0, 0, 0, 0.8)',
        color: countColor
      }}
    >
      {currentCount}
    </div>
  );
};

export default GiftCounter;