import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

  return (
    <Card className="bg-black/50 border border-gray-200 dark:border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-lg sm:text-xl">Stopwatch</CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="digital text-neon-red text-[clamp(1.5rem,5vw,2.5rem)] mb-4 animate-led-flicker tracking-wider">
          {hours.toString().padStart(2, '0')}:
          {minutes.toString().padStart(2, '0')}:
          {seconds.toString().padStart(2, '0')}.
          {milliseconds.toString().padStart(2, '0')}
        </div>
        <div className="flex gap-2 px-2">
          <Button 
            onClick={() => setIsRunning(!isRunning)}
            variant="outline"
            className="flex-1 text-sm"
          >
            {isRunning ? 'Stop' : 'Start'}
          </Button>
          <Button 
            onClick={reset}
            variant="outline"
            className="flex-1 text-sm"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Stopwatch;