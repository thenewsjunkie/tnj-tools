import GiftCounter from "./GiftCounter";
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

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
  useEffect(() => {
    if (!isGiftAlert || giftCount <= 1) return;

    const duration = 2000;
    const end = Date.now() + duration;
    
    const frame = () => {
      // Base particle configuration
      const baseParticleCount = giftCount > 10 ? 3 : 2;
      const baseSpread = giftCount > 10 ? 70 : 55;
      
      // For 2-5 gifts: confetti only
      if (giftCount >= 2 && giftCount <= 5) {
        confetti({
          particleCount: baseParticleCount,
          angle: 60,
          spread: baseSpread,
          origin: { x: 0 },
          colors: ['#ff0000', '#00ff00', '#0000ff']
        });
        confetti({
          particleCount: baseParticleCount,
          angle: 120,
          spread: baseSpread,
          origin: { x: 1 },
          colors: ['#ff0000', '#00ff00', '#0000ff']
        });
      }
      
      // For 5-10 gifts: fireworks effect
      else if (giftCount > 5 && giftCount <= 10) {
        const firework = () => {
          const startX = Math.random();
          const startY = Math.random() * 0.5;
          
          confetti({
            particleCount: 30,
            angle: 360 * Math.random(),
            spread: 60,
            origin: { x: startX, y: startY },
            colors: ['#ff4444', '#ffff44', '#44ff44', '#44ffff'],
            ticks: 100,
            gravity: 0.8,
            scalar: 1.2,
            drift: 0
          });
        };
        
        firework();
      }
      
      // For 10+ gifts: combined effects with increased intensity
      else if (giftCount > 10) {
        // Intense confetti
        confetti({
          particleCount: Math.min(5 + Math.floor(giftCount / 10), 10),
          angle: 60,
          spread: baseSpread,
          origin: { x: 0 },
          colors: ['#ff0000', '#00ff00', '#0000ff', '#ff44ff', '#44ffff']
        });
        confetti({
          particleCount: Math.min(5 + Math.floor(giftCount / 10), 10),
          angle: 120,
          spread: baseSpread,
          origin: { x: 1 },
          colors: ['#ff0000', '#00ff00', '#0000ff', '#ff44ff', '#44ffff']
        });
        
        // Intense fireworks
        const firework = () => {
          const startX = Math.random();
          const startY = Math.random() * 0.5;
          
          confetti({
            particleCount: Math.min(40 + Math.floor(giftCount / 5), 80),
            angle: 360 * Math.random(),
            spread: 70,
            origin: { x: startX, y: startY },
            colors: ['#ff4444', '#ffff44', '#44ff44', '#44ffff', '#ff44ff'],
            ticks: 100,
            gravity: 0.8,
            scalar: 1.2,
            drift: 0
          });
        };
        
        firework();
      }

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [isGiftAlert, giftCount]);

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