import { useEffect } from "react";
import AlertMessage from "../../AlertMessage";
import confetti from 'canvas-confetti';

interface AlertPreviewProps {
  message: string;
  fontSize: number;
  textColor: string;
  textAlignment: string;
  textAnimation: string;
  backgroundColor: string;
  confettiEnabled: boolean;
}

const AlertPreview = ({
  message,
  fontSize,
  textColor,
  textAlignment,
  textAnimation,
  backgroundColor,
  confettiEnabled
}: AlertPreviewProps) => {
  useEffect(() => {
    if (confettiEnabled) {
      const canvas = document.getElementById('preview-confetti') as HTMLCanvasElement;
      if (canvas) {
        const myConfetti = confetti.create(canvas, {
          resize: true,
          useWorker: true
        });

        const duration = 2000;
        const end = Date.now() + duration;

        const frame = () => {
          myConfetti({
            particleCount: 7,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ff44ff', '#44ffff']
          });
          myConfetti({
            particleCount: 7,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ff44ff', '#44ffff']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };

        frame();

        return () => {
          myConfetti.reset();
        };
      }
    }
  }, [confettiEnabled]);

  return (
    <div className="mt-4 p-4 rounded-lg relative" style={{ backgroundColor: `#000000CC` }}>
      <AlertMessage
        message={message}
        fontSize={fontSize}
        textColor={textColor}
        textAlignment={textAlignment}
        textAnimation={textAnimation}
      />
      {confettiEnabled && (
        <div className="absolute inset-0 pointer-events-none">
          <canvas id="preview-confetti" className="w-full h-full" />
        </div>
      )}
    </div>
  );
};

export default AlertPreview;