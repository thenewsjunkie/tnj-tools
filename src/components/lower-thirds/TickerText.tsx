import { useEffect, useRef, useState } from 'react';

interface TickerTextProps {
  text: string;
}

const TickerText = ({ text }: TickerTextProps) => {
  const [duration, setDuration] = useState(60);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!text || !containerRef.current || !textRef.current) return;

    // Get the width of the container and the text
    const containerWidth = containerRef.current.offsetWidth;
    const textWidth = textRef.current.offsetWidth;

    // Calculate duration based on text length (125 pixels per second)
    const newDuration = textWidth / 125;
    setDuration(newDuration);
  }, [text]);

  if (!text) return null;

  return (
    <div 
      ref={containerRef}
      className="mt-2 bg-black/90 text-white p-4 w-full overflow-hidden whitespace-nowrap animate-slide-in-bottom text-3xl md:text-4xl" 
      style={{ animationDelay: '300ms' }}
    >
      <div className="relative inline-flex whitespace-nowrap">
        <div 
          ref={textRef}
          className="animate-none"
          style={{
            animation: `marquee ${duration}s linear infinite`,
            paddingRight: '100vw' // Add full viewport width as padding to prevent overlap
          }}
        >
          {text}
        </div>
        <div 
          className="absolute top-0 left-full"
          style={{
            animation: `marquee ${duration}s linear infinite`,
            animationDelay: `${duration / 2}s`,
            paddingRight: '100vw' // Add full viewport width as padding to prevent overlap
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

export default TickerText;