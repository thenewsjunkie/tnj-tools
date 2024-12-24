import { format } from "date-fns";

interface TimeDisplayProps {
  currentTime: Date;
  show: boolean;
}

const TimeDisplay = ({ currentTime, show }: TimeDisplayProps) => {
  if (!show) return null;

  return (
    <div className="text-neon-red font-bold text-2xl bg-black/90 px-4 py-1">
      {format(currentTime, 'h:mm')}{format(currentTime, 'a')}
    </div>
  );
};

export default TimeDisplay;