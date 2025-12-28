import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    if (isRunning) {
      intervalId = setInterval(() => setTime(time + 1), 10);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, time]);

  const hours = Math.floor(time / 360000);
  const minutes = Math.floor((time % 360000) / 6000);
  const seconds = Math.floor((time % 6000) / 100);
  const milliseconds = time % 100;

  const reset = () => {
    setTime(0);
    setIsRunning(false);
  };

  const formatTime = () => 
    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;

  return (
    <div className="space-y-2">
      <div className="digital text-neon-red text-xl animate-led-flicker tracking-wider">
        {formatTime()}
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={() => setIsRunning(!isRunning)}
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
        >
          {isRunning ? 'Stop' : 'Start'}
        </Button>
        <Button 
          onClick={reset}
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default Stopwatch;