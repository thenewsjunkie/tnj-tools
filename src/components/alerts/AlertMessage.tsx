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
}

const AlertMessage = ({ 
  message, 
  fontSize = 24,
  isGiftAlert = false,
  giftCount = 1,
  giftCountAnimationSpeed = 100,
  giftTextColor = "#FFFFFF",
  giftCountColor = "#4CDBC4",
  onCountComplete
}: AlertMessageProps) => {
  useGiftAnimation({ isGiftAlert, giftCount });

  if (isGiftAlert) {
    // Extract and decode username from the message
    const encodedUsername = message.split(' ')[0];
    const username = decodeURIComponent(encodedUsername);
    
    // Replace {count} placeholder with actual count
    const formattedMessage = message.replace('{count}', giftCount.toString());
    
    console.log('[AlertMessage] Gift alert details:', {
      encodedUsername,
      decodedUsername: username,
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

  // Find and decode the username for regular alerts
  const subscribedIndex = message.indexOf(' just');
  const encodedUsername = subscribedIndex === -1 ? message : message.slice(0, subscribedIndex);
  const username = decodeURIComponent(encodedUsername);
  const restOfMessage = subscribedIndex === -1 ? '' : message.slice(subscribedIndex);

  return (
    <div className="fixed bottom-0 left-0 right-0 mb-4">
      <div 
        className="text-white alert-message-font text-center"
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
    </div>
  );
};

export default AlertMessage;