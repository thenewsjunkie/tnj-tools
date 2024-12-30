import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface UseGiftAnimationProps {
  isGiftAlert: boolean;
  giftCount: number;
}

export const useGiftAnimation = ({ isGiftAlert, giftCount }: UseGiftAnimationProps) => {
  useEffect(() => {
    if (!isGiftAlert || giftCount <= 1) return;

    // Reduce total duration - now based just on gift count
    const baseAnimationSpeed = 200;
    const totalDuration = giftCount * baseAnimationSpeed + 2000; // Reduced from 5000ms to 2000ms padding
    const startTime = Date.now();
    
    const createConfetti = (angle: number, origin: { x: number }) => {
      confetti({
        particleCount: Math.min(5 + Math.floor(giftCount / 10), 10),
        angle,
        spread: 55,
        origin,
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ff44ff', '#44ffff']
      });
    };

    const createFirework = () => {
      // Adjusted firework parameters for better visibility
      confetti({
        particleCount: 50,
        spread: 360,
        startVelocity: 30,
        decay: 0.95,
        gravity: 1,
        drift: 0,
        ticks: 200,
        origin: {
          x: Math.random(),
          y: Math.random() * 0.5
        },
        colors: ['#ff4444', '#ffff44', '#44ff44', '#44ffff', '#ff44ff'],
        shapes: ['circle'],
        scalar: 1
      });
    };
    
    const frame = () => {
      const now = Date.now();
      if (now - startTime < totalDuration) {
        // For 2-5 gifts: confetti only
        if (giftCount >= 2 && giftCount <= 5) {
          createConfetti(60, { x: 0 });
          createConfetti(120, { x: 1 });
        }
        
        // For 5+ gifts: both confetti and fireworks
        else if (giftCount > 5) {
          createConfetti(60, { x: 0 });
          createConfetti(120, { x: 1 });
          // Reduced firework frequency
          if (Math.random() < 0.3) { // 30% chance each frame
            createFirework();
          }
        }

        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [isGiftAlert, giftCount]);
};