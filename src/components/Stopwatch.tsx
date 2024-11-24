import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let intervalId: number;
    if (isRunning) {
      intervalId = setInterval(() => setTime(time + 1), 10);
    }
    return () => clearInterval(intervalId);
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
    <Card className="bg-black/50 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Stopwatch</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="digital text-neon-red text-6xl mb-4 animate-led-flicker">
          {hours.toString().padStart(2, '0')}:
          {minutes.toString().padStart(2, '0')}:
          {seconds.toString().padStart(2, '0')}.
          {milliseconds.toString().padStart(2, '0')}
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsRunning(!isRunning)}
            variant="outline"
            className="flex-1"
          >
            {isRunning ? 'Stop' : 'Start'}
          </Button>
          <Button 
            onClick={reset}
            variant="outline"
            className="flex-1"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Stopwatch;