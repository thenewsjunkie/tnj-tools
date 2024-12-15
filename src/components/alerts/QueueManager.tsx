import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface QueueManagerProps {
  currentAlert: any;
  queueCount: number;
  isPaused: boolean;
  processNextAlert: () => void;
}

const QueueManager = ({ currentAlert, queueCount, isPaused, processNextAlert }: QueueManagerProps) => {
  useEffect(() => {
    // If there's no current alert and the queue isn't paused, try to process the next alert
    if (!currentAlert && !isPaused) {
      console.log('No current alert, attempting to process next');
      processNextAlert();
    }
  }, [currentAlert, isPaused, processNextAlert]);

  useEffect(() => {
    const channel = supabase.channel('alert-queue')
      .on('broadcast', { event: 'alert_completed' }, async () => {
        console.log('Alert completed event received');
        if (!isPaused) {
          processNextAlert();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [processNextAlert, isPaused]);

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