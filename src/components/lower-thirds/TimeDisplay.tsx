import { format } from "date-fns";

interface TimeDisplayProps {
  currentTime: Date;
  show: boolean;
}

const TimeDisplay = ({ currentTime, show }: TimeDisplayProps) => {
  if (!show) return null;

  return (
    <div className="text-neon-red font-bold text-2xl">
      {format(currentTime, 'h:mm')}{format(currentTime, 'a')}
    </div>
  );
};

export default TimeDisplay;