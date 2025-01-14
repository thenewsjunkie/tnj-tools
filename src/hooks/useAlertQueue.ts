import { useQueueData } from "./useQueueData";
import { useQueueState } from "./useQueueState";
import { useQueueActions } from "./useQueueActions";

export const useAlertQueue = () => {
  const { queueData, refetch: refetchQueue } = useQueueData();
  const { currentAlert, isPaused, togglePause } = useQueueState();
  const { handleAlertComplete, processNextAlert } = useQueueActions(refetchQueue);

  return {
    currentAlert,
    queueCount: queueData?.length || 0,
    pendingAlerts: queueData || [],
    processNextAlert: (isPaused: boolean) => processNextAlert(isPaused, currentAlert, queueData || []),
    refetchQueue,
    handleAlertComplete: () => handleAlertComplete(currentAlert),
    isPaused,
    togglePause
  };
};