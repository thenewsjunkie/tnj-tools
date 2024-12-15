import { useQueueData } from "./useQueueData";

export const useQueueState = () => {
  const { queueData } = useQueueData();

  const currentAlert = queueData?.find(item => item.status === 'playing');
  const pendingAlerts = queueData?.filter(item => item.status === 'pending') || [];
  const queueCount = (queueData || []).length;

  return {
    currentAlert,
    pendingAlerts,
    queueCount
  };
};