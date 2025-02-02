import { useQueueData } from "./useQueueData";
import { useQueueState } from "./useQueueState";
import { useQueueActions } from "./useQueueActions";

export const useAlertQueue = () => {
  const { queueData, refetch: refetchQueue } = useQueueData();
  const { currentAlert, pendingAlerts, queueCount } = useQueueState();
  const { handleAlertComplete, processNextAlert } = useQueueActions(refetchQueue);

  return {
    currentAlert,
    queueCount,
    pendingAlerts,
    processNextAlert: (isPaused: boolean) => processNextAlert(isPaused, currentAlert, pendingAlerts),
    refetchQueue,
    handleAlertComplete: () => handleAlertComplete(currentAlert)
  };
};