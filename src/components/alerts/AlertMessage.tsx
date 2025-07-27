import GiftCounter from "./GiftCounter";
import { useGiftAnimation } from "@/hooks/useGiftAnimation";

interface AlertMessageProps {
  message: string;
  username?: string;
  fontSize?: number;
  isGiftAlert?: boolean;
  giftCount?: number;
  giftCountAnimationSpeed?: number;
  giftTextColor?: string;
  giftCountColor?: string;
  onCountComplete?: () => void;
}

const AlertMessage = ({ 
  message,
  username,
  fontSize = 48,
  isGiftAlert = false,
  giftCount = 1,
  giftCountAnimationSpeed = 100,
  giftTextColor = "#FFFFFF",
  giftCountColor = "#4CDBC4",
  onCountComplete
}: AlertMessageProps) => {
  useGiftAnimation({ isGiftAlert, giftCount });

  if (isGiftAlert) {
    // Decode username properly, handling URL encoding like %20
    const displayUsername = username ? decodeURIComponent(username) : 
      decodeURIComponent(message.split(' ')[0]);
    
    // Replace {count} placeholder with actual count
    const formattedMessage = message.replace('{count}', giftCount.toString());
    
    console.log('[AlertMessage] Gift alert details:', {
      providedUsername: username,
      displayUsername,
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
            textShadow: '3px 3px 0px rgba(0, 0, 0, 1), -1px -1px 0px rgba(0, 0, 0, 1), 1px -1px 0px rgba(0, 0, 0, 1), -1px 1px 0px rgba(0, 0, 0, 1), 4px 4px 8px rgba(0, 0, 0, 0.8)',
            WebkitTextStroke: '1px rgba(0, 0, 0, 0.8)',
            color: giftTextColor
          }}
        >
          {displayUsername} Gifted
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
            textShadow: '3px 3px 0px rgba(0, 0, 0, 1), -1px -1px 0px rgba(0, 0, 0, 1), 1px -1px 0px rgba(0, 0, 0, 1), -1px 1px 0px rgba(0, 0, 0, 1), 4px 4px 8px rgba(0, 0, 0, 0.8)',
            WebkitTextStroke: '1px rgba(0, 0, 0, 0.8)',
            color: giftTextColor
          }}
        >
          {formattedMessage.substring(formattedMessage.indexOf(' ') + 1)}
        </div>
      </div>
    );
  }

  // Decode username properly, handling URL encoding like %20
  const displayUsername = username ? decodeURIComponent(username) : (() => {
    const subscribedIndex = message.indexOf(' just');
    const encodedUsername = subscribedIndex === -1 ? message : message.slice(0, subscribedIndex);
    return decodeURIComponent(encodedUsername);
  })();

  return (
    <div className="text-white alert-message-font text-center">
      <div
        style={{ 
          fontSize: `${fontSize}px`,
          textShadow: '3px 3px 0px rgba(0, 0, 0, 1), -1px -1px 0px rgba(0, 0, 0, 1), 1px -1px 0px rgba(0, 0, 0, 1), -1px 1px 0px rgba(0, 0, 0, 1), 4px 4px 8px rgba(0, 0, 0, 0.8)',
          WebkitTextStroke: '1px rgba(0, 0, 0, 0.8)',
          lineHeight: '1.2',
          color: '#4CDBC4'
        }}
      >
        {displayUsername}
      </div>
      <div
        style={{ 
          fontSize: `${fontSize}px`,
          textShadow: '3px 3px 0px rgba(0, 0, 0, 1), -1px -1px 0px rgba(0, 0, 0, 1), 1px -1px 0px rgba(0, 0, 0, 1), -1px 1px 0px rgba(0, 0, 0, 1), 4px 4px 8px rgba(0, 0, 0, 0.8)',
          WebkitTextStroke: '1px rgba(0, 0, 0, 0.8)',
          lineHeight: '1.2',
          color: '#FFFFFF'
        }}
      >
        {message}
      </div>
    </div>
  );
};

export default AlertMessage;