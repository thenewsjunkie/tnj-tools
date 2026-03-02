import { useState, useEffect } from "react";
import { format } from "date-fns";
import type { OverlayPosition } from "@/hooks/useOutputConfig";

const POSITION_CLASSES: Record<OverlayPosition, string> = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
};

const ClockOverlay = ({ position = "top-left" }: { position?: OverlayPosition }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`absolute ${POSITION_CLASSES[position]} z-[5000] pointer-events-none`}
    >
      <span className="text-red-500 font-bold text-2xl tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] bg-black/40 px-3 py-1 rounded-md">
        {format(time, "h:mmaa")}
      </span>
    </div>
  );
};

export default ClockOverlay;
