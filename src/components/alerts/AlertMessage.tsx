import GiftCounter from "./GiftCounter";
import { useGiftAnimation } from "@/hooks/useGiftAnimation";

interface AlertMessageProps {
  message: string;
  fontSize?: number;
  isGiftAlert?: boolean;
  giftCount?: number;
  giftCountAnimationSpeed?: number;
  giftTextColor?: string;
  giftCountColor?: string;
  onCountComplete?: () => void;
  textColor?: string;
  textAlignment?: string;
  fontFamily?: string;
  textAnimation?: string;
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
  textColor = "#FFFFFF",
  textAlignment = "center",
  fontFamily = "Radiate Sans Extra Bold",
  textAnimation = "none"
}: AlertMessageProps) => {
  useGiftAnimation({ isGiftAlert, giftCount });

  const getAnimationClass = () => {
    switch (textAnimation) {
      case "pulse":
        return "animate-pulse";
      case "bounce":
        return "animate-bounce";
      case "wave":
        return "animate-wave";
      default:
        return "";
    }
  };

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

  return (
    <div 
      className={`alert-message-font mt-2 ${getAnimationClass()}`}
      style={{ 
        fontSize: `${fontSize}px`,
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        lineHeight: '1.2',
        minHeight: `${fontSize * 1.2}px`,
        color: textColor,
        textAlign: textAlignment as "left" | "center" | "right",
        fontFamily
      }}
    >
      {message}
    </div>
  );
};

export default AlertMessage;