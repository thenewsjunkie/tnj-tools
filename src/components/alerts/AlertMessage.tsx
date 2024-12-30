import GiftCounter from "./GiftCounter";

interface AlertMessageProps {
  message: string;
  fontSize?: number;
  isGiftAlert?: boolean;
  giftCount?: number;
  giftCountAnimationSpeed?: number;
  giftTextColor?: string;
  giftCountColor?: string;
}

const AlertMessage = ({ 
  message, 
  fontSize = 24,
  isGiftAlert = false,
  giftCount = 1,
  giftCountAnimationSpeed = 100,
  giftTextColor = "#FFFFFF",
  giftCountColor = "#4CDBC4"
}: AlertMessageProps) => {
  if (isGiftAlert) {
    // Extract username from the message
    const username = message.split(' ')[0];
    
    console.log('[AlertMessage] Gift alert details:', {
      username,
      providedGiftCount: giftCount,
      message
    });
    
    return (
      <div className="mt-2 text-center">
        <div 
          className="alert-message-font"
          style={{ 
            fontSize: `${fontSize}px`,
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            color: giftTextColor
          }}
        >
          {username} Gifted
        </div>
        <GiftCounter 
          targetCount={giftCount}
          animationSpeed={giftCountAnimationSpeed}
          textColor={giftTextColor}
          countColor={giftCountColor}
        />
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