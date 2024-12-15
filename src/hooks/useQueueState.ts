import { useState } from "react";
import { useQueueData } from "./useQueueData";

export const useQueueState = () => {
  const { queueData } = useQueueData();
  const [isPaused, setIsPaused] = useState(false);

  const currentAlert = queueData?.find(item => item.status === 'playing');
  const pendingAlerts = queueData?.filter(item => item.status === 'pending') || [];
  const queueCount = (queueData || []).length;

  const togglePause = async () => {
    setIsPaused(!isPaused);
    return !isPaused;
  };

  return {
    currentAlert,
    pendingAlerts,
    queueCount,
    isPaused,
    togglePause
  };
};