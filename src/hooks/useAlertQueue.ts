import { useQueueData } from "./useQueueData";
import { useQueueState } from "./useQueueState";
import { useQueueActions } from "./useQueueActions";
import { alertLogger } from "@/utils/alertLogger";

export const useAlertQueue = () => {
  const { queueData, refetch: refetchQueue } = useQueueData();
  const { currentAlert, pendingAlerts, queueCount } = useQueueState();
  const { handleAlertComplete, processNextAlert } = useQueueActions(refetchQueue);

  return {
    currentAlert,
    queueCount,
    pendingAlerts,
    processNextAlert: (isPaused: boolean) => {
      alertLogger.queueData('Processing next alert, paused:', isPaused);
      return processNextAlert(isPaused, currentAlert, pendingAlerts);
    },
    refetchQueue,
    handleAlertComplete: () => {
      alertLogger.queueData('Completing alert:', currentAlert?.id);
      return handleAlertComplete(currentAlert);
    }
  };
};