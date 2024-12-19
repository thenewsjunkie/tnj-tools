import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { PauseCircle } from "lucide-react";
import { useEffect, useRef } from "react";

interface QueueManagerProps {
  currentAlert: any;
  queueCount: number;
  isPaused: boolean;
  processNextAlert: () => void;
}

const QueueManager = ({ currentAlert, queueCount, isPaused, processNextAlert }: QueueManagerProps) => {
  const processingRef = useRef(false);

  // Effect to process next alert when queue is empty and not paused
  useEffect(() => {
    if (!currentAlert && queueCount > 0 && !isPaused && !processingRef.current) {
      console.log('[QueueManager] No current alert and queue not empty, processing next alert');
      processingRef.current = true;
      processNextAlert();
      // Reset processing flag after a delay
      setTimeout(() => {
        processingRef.current = false;
      }, 1000);
    }
  }, [currentAlert, queueCount, isPaused, processNextAlert]);

  // Only show if there are alerts in queue or if paused or if there's a current alert
  if (!currentAlert && queueCount === 0 && !isPaused) {
    console.log('[QueueManager] No alerts to display, hiding manager');
    return null;
  }

  return (
    <div className="px-6 pb-4">
      <Alert>
        {isPaused && (
          <div className="flex items-center gap-2 mb-2">
            <PauseCircle className="h-4 w-4 text-neon-red" />
            <AlertTitle className="text-neon-red">Queue Paused</AlertTitle>
          </div>
        )}
        {currentAlert ? (
          <>
            <AlertTitle>Current Alert: {currentAlert.alert.title}</AlertTitle>
            {currentAlert.alert.message_enabled && currentAlert.username && (
              <AlertDescription>
                {currentAlert.username} {currentAlert.alert.message_text}
              </AlertDescription>
            )}
          </>
        ) : null}
        <AlertDescription className="mt-2 text-sm text-muted-foreground">
          Queue: {queueCount} alert{queueCount !== 1 ? 's' : ''}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default QueueManager;