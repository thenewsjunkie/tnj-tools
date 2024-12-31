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
      // Calculate the current speed based on count ranges
      let currentSpeed = animationSpeed;
      
      if (currentCount > 50) {
        currentSpeed = animationSpeed / 3; // 3x faster after 50
      } else if (currentCount > 10) {
        currentSpeed = animationSpeed / 1.5; // 1.5x faster between 11-50
      }

      const timeout = setTimeout(() => {
        // Increment by larger steps for higher counts to ensure we reach the target
        let increment = 1;
        if (targetCount > 100 && currentCount > 50) {
          increment = 3; // Increment by 3 for large counts after 50
        } else if (targetCount > 50 && currentCount > 10) {
          increment = 2; // Increment by 2 for medium counts after 10
        }

        const nextCount = Math.min(currentCount + increment, targetCount);
        setCurrentCount(nextCount);

        // Log for debugging
        console.log('[GiftCounter] Counting:', {
          current: currentCount,
          next: nextCount,
          target: targetCount,
          speed: currentSpeed,
          increment
        });
      }, currentSpeed);
      
      return () => clearTimeout(timeout);
    } else if (currentCount === targetCount) {
      console.log('[GiftCounter] Counting complete:', targetCount);
      onCountComplete?.();
    }
  }, [currentCount, targetCount, animationSpeed, onCountComplete]);

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