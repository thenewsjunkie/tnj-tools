import { useEffect, useRef, useState } from "react";
import GiftCounter from "./GiftCounter";
import { useGiftAnimation } from "@/hooks/useGiftAnimation";
import confetti from 'canvas-confetti';
import { AlertEffect } from "@/types/alerts";

interface AlertMessageProps {
  message: string;
  fontSize?: number;
  isGiftAlert?: boolean;
  giftCount?: number;
  giftCountAnimationSpeed?: number;
  giftTextColor?: string;
  giftCountColor?: string;
  onCountComplete?: () => void;
  // New message alert props
  isMessageAlert?: boolean;
  textColor?: string;
  backgroundColor?: string;
  textAlignment?: 'left' | 'center' | 'right';
  fontFamily?: string;
  textShadow?: boolean;
  textAnimation?: string;
  effects?: AlertEffect[];
  useGradient?: boolean;
  gradientColor?: string;
}

const AlertMessage = ({ 
  message, 
  fontSize = 24,
  isGiftAlert = false,
  giftCount = 1,
  giftCountAnimationSpeed = 100,
  giftTextColor = "#FFFFFF",
  giftCountColor = "#4CDBC4",
  onCountComplete,
  isMessageAlert = false,
  textColor = "#FFFFFF",
  backgroundColor = "rgba(0, 0, 0, 0.8)",
  textAlignment = 'center',
  fontFamily = "Arial",
  textShadow = false,
  textAnimation = "none",
  effects = [],
  useGradient = false,
  gradientColor = "#000000"
}: AlertMessageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [calculatedFontSize, setCalculatedFontSize] = useState(fontSize);
  
  useGiftAnimation({ isGiftAlert, giftCount });

  useEffect(() => {
    if (isMessageAlert && containerRef.current) {
      // Calculate optimal font size based on container size and message length
      const container = containerRef.current;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      const wordCount = message.split(' ').length;
      
      // Basic algorithm to determine font size
      const baseSize = Math.min(
        containerWidth / (wordCount * 2),
        containerHeight / 3
      );
      
      setCalculatedFontSize(Math.min(Math.max(baseSize, 24), 200));
    }
  }, [isMessageAlert, message]);

  useEffect(() => {
    if (isMessageAlert && effects.length > 0) {
      effects.forEach(effect => {
        switch (effect) {
          case 'confetti':
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
            break;
          // Add other effect implementations
        }
      });
    }
  }, [isMessageAlert, effects]);

  const getTextAnimation = () => {
    switch (textAnimation) {
      case 'pulse':
        return 'animate-pulse';
      case 'bounce':
        return 'animate-bounce';
      case 'wave':
        return 'animate-wave';
      case 'shake':
        return 'animate-shake';
      default:
        return '';
    }
  };

  if (isMessageAlert) {
    const backgroundStyle = useGradient
      ? `linear-gradient(to bottom, ${backgroundColor}, ${gradientColor})`
      : backgroundColor;

    return (
      <div
        ref={containerRef}
        className="fixed inset-0 flex items-center justify-center p-8"
        style={{ 
          background: backgroundStyle,
          fontFamily
        }}
      >
        <div 
          className={`text-center ${getTextAnimation()}`}
          style={{
            color: textColor,
            fontSize: `${calculatedFontSize}px`,
            textAlign: textAlignment,
            textShadow: textShadow ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
            maxWidth: '90%',
            wordWrap: 'break-word'
          }}
        >
          {message}
        </div>
      </div>
    );
  }

  if (isGiftAlert) {
    // Extract username from the message
    const username = message.split(' ')[0];
    
    // Replace {count} placeholder with actual count
    const formattedMessage = message.replace('{count}', giftCount.toString());
    
    console.log('[AlertMessage] Gift alert details:', {
      username,
      giftCount,
      originalMessage: message,
      formattedMessage
    });
    
    return (
      <div className="flex flex-col gap-2 items-center">
        <div 
          className="alert-message-font text-center"
          style={{ 
            fontSize: `${fontSize}px`,
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            color: giftTextColor
          }}
        >
          {username} Gifted
        </div>
        <div className="flex justify-center w-full">
          <GiftCounter 
            targetCount={giftCount}
            animationSpeed={giftCountAnimationSpeed}
            textColor={giftTextColor}
            countColor={giftCountColor}
            fontSize={fontSize * 1.5}
            onCountComplete={onCountComplete}
          />
        </div>
        <div 
          className="alert-message-font text-center"
          style={{ 
            fontSize: `${fontSize * 0.8}px`,
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            color: giftTextColor
          }}
        >
          {formattedMessage.substring(formattedMessage.indexOf(' ') + 1)}
        </div>
      </div>
    );
  }

  // Find the username by looking for the word that comes before "just subscribed"
  const subscribedIndex = message.indexOf(' just');
  const username = subscribedIndex === -1 ? message : message.slice(0, subscribedIndex);
  const restOfMessage = subscribedIndex === -1 ? '' : message.slice(subscribedIndex);

  return (
    <div 
      className="text-white alert-message-font mt-2 text-center"
      style={{ 
        fontSize: `${fontSize}px`,
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        lineHeight: '1.2',
        minHeight: `${fontSize * 1.2}px`
      }}
    >
      <span className="text-[#4CDBC4]">{username}</span>
      {restOfMessage && (
        <span className="break-words inline-block">{restOfMessage}</span>
      )}
    </div>
  );
};

export default AlertMessage;