import { Button } from "@/components/ui/button";
import { Plus, Link, Pause, Play } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AlertsHeaderProps {
  isPaused: boolean;
  togglePause: () => void;
  openDialog: () => void;
}

const AlertsHeader = ({ isPaused, togglePause, openDialog }: AlertsHeaderProps) => {
  const { toast } = useToast();

  return (
    <div className="flex flex-col space-y-1.5 p-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">Alerts</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={togglePause}
            className={isPaused ? "text-neon-red" : "text-neon-red"}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          <a
            href="/alerts"
            target="_blank"
            rel="noopener noreferrer"
            className="alert-icon hover:text-neon-red hover:bg-white/10 rounded-md p-2"
          >
            <Link className="h-4 w-4" />
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={openDialog}
            className="alert-icon hover:text-neon-red hover:bg-white/10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertsHeader;