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
    // Only process if we have alerts to process, aren't already processing, and queue isn't paused
    if (!currentAlert && queueCount > 0 && !isPaused && !processingRef.current) {
      console.log('[QueueManager] Processing next alert. Current state:', {
        currentAlert,
        queueCount,
        isPaused,
        processing: processingRef.current
      });
      
      processingRef.current = true;
      processNextAlert();
    }
    
    // Cleanup function to reset processing state
    return () => {
      processingRef.current = false;
    };
  }, [currentAlert, queueCount, isPaused, processNextAlert]);

  // Only show if there are alerts in queue or if paused or if there's a current alert
  if (!currentAlert && queueCount === 0 && !isPaused) {
    console.log('[QueueManager] No alerts to display, hiding manager');
    return null;
  }

  // Calculate total alerts (pending + current if exists)
  const totalAlerts = queueCount + (currentAlert ? 1 : 0);

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
          Queue: {totalAlerts} alert{totalAlerts !== 1 ? 's' : ''}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default QueueManager;