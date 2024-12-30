import { Trophy, Gift } from "lucide-react";
import { Link } from "react-router-dom";

interface AlertStatusProps {
  isPaused: boolean;
  totalAlertsSent: number;
}

const AlertStatus = ({ isPaused, totalAlertsSent }: AlertStatusProps) => {
  return (
    <>
      <div className="absolute bottom-3 left-4 text-xs text-muted-foreground">
        Queue Status: {isPaused ? 'Paused' : 'Playing'}
      </div>
      <div className="absolute bottom-3 right-4 flex items-center gap-2">
        <Link 
          to="/leaderboard" 
          className="text-muted-foreground hover:text-primary transition-colors"
          title="View Leaderboard"
        >
          <Trophy className="h-4 w-4" />
        </Link>
        <Link 
          to="/admin/gift-stats" 
          className="text-muted-foreground hover:text-primary transition-colors"
          title="View Gift Statistics"
        >
          <Gift className="h-4 w-4" />
        </Link>
        <span className="text-xs text-muted-foreground">
          Total Alerts Sent: {totalAlertsSent}
        </span>
      </div>
    </>
  );
};

export default AlertStatus;