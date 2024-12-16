import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface QueueManagerProps {
  currentAlert: any;
  queueCount: number;
  isPaused: boolean;
  processNextAlert: () => void;
}

const QueueManager = ({ currentAlert, queueCount, isPaused, processNextAlert }: QueueManagerProps) => {
  // Always show if there are alerts in queue, even when paused
  if (!currentAlert && queueCount === 0) return null;

  return (
    <div className="px-6 pb-4">
      <Alert>
        {currentAlert ? (
          <>
            <AlertTitle>Current Alert: {currentAlert.alert.title}</AlertTitle>
            {currentAlert.alert.message_enabled && currentAlert.username && (
              <AlertDescription>
                {currentAlert.username} {currentAlert.alert.message_text}
              </AlertDescription>
            )}
          </>
        ) : isPaused && queueCount > 0 ? (
          <AlertTitle>Queue Paused</AlertTitle>
        ) : null}
        <AlertDescription className="mt-2 text-sm text-muted-foreground">
          Queue: {queueCount} alert{queueCount !== 1 ? 's' : ''}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default QueueManager;