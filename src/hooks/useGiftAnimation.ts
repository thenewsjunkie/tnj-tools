import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface UseGiftAnimationProps {
  isGiftAlert: boolean;
  giftCount: number;
}

export const useGiftAnimation = ({ isGiftAlert, giftCount }: UseGiftAnimationProps) => {
  useEffect(() => {
    if (!isGiftAlert || giftCount <= 1) return;

    const duration = 2000;
    const end = Date.now() + duration;
    
    const createConfetti = (angle: number, origin: { x: number }) => {
      const baseParticleCount = giftCount > 10 ? 3 : 2;
      const baseSpread = giftCount > 10 ? 70 : 55;
      
      confetti({
        particleCount: Math.min(5 + Math.floor(giftCount / 10), 10),
        angle,
        spread: baseSpread,
        origin,
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ff44ff', '#44ffff']
      });
    };

    const createFirework = () => {
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
    
    const frame = () => {
      // For 2-5 gifts: confetti only
      if (giftCount >= 2 && giftCount <= 5) {
        createConfetti(60, { x: 0 });
        createConfetti(120, { x: 1 });
      }
      
      // For 5-10 gifts: fireworks effect
      else if (giftCount > 5 && giftCount <= 10) {
        createFirework();
      }
      
      // For 10+ gifts: combined effects with increased intensity
      else if (giftCount > 10) {
        createConfetti(60, { x: 0 });
        createConfetti(120, { x: 1 });
        createFirework();
      }

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [isGiftAlert, giftCount]);
};