import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface QueueManagerProps {
  currentAlert: any;
  queueCount: number;
  isPaused: boolean;
  processNextAlert: () => void;
}

const QueueManager = ({ currentAlert, queueCount, isPaused, processNextAlert }: QueueManagerProps) => {
  if (!currentAlert) return null;

  return (
    <div className="px-6 pb-4">
      <Alert>
        <AlertTitle>Current Alert: {currentAlert.alert.title}</AlertTitle>
        {currentAlert.alert.message_enabled && currentAlert.username && (
          <AlertDescription>
            {currentAlert.username} {currentAlert.alert.message_text}
          </AlertDescription>
        )}
        <AlertDescription className="mt-2 text-sm text-muted-foreground">
          Queue: {queueCount} alert{queueCount !== 1 ? 's' : ''}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default QueueManager;