import { Button } from "@/components/ui/button";
import { Plus, Link, Pause, Play, History } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link as RouterLink } from "react-router-dom";

interface AlertsHeaderProps {
  isPaused: boolean;
  togglePause: () => void;
  openDialog: () => void;
}

const AlertsHeader = ({ isPaused, togglePause, openDialog }: AlertsHeaderProps) => {
  const { toast } = useToast();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={togglePause}
          className={isPaused ? "text-neon-red" : "text-neon-red"}
        >
          {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
        </Button>
        <RouterLink to="/admin/queue-history">
          <Button
            variant="outline"
            size="sm"
            className="alert-icon hover:text-neon-red hover:bg-white/10"
          >
            <History className="h-3 w-3" />
          </Button>
        </RouterLink>
        <a
          href="/alerts"
          target="_blank"
          rel="noopener noreferrer"
          className="alert-icon hover:text-neon-red hover:bg-white/10 rounded-md p-1.5"
        >
          <Link className="h-3 w-3" />
        </a>
        <Button
          variant="ghost"
          size="sm"
          onClick={openDialog}
          className="alert-icon hover:text-neon-red hover:bg-white/10"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default AlertsHeader;