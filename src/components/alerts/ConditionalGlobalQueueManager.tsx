import { useLocation } from "react-router-dom";
import { shouldExcludeGlobalQueueManager } from "@/utils/routeUtils";
import AlertQueueManager from "./AlertQueueManager";

const ConditionalGlobalQueueManager = () => {
  const location = useLocation();
  
  // Don't render GlobalQueueManager on OBS/embed pages that don't need alert functionality
  if (shouldExcludeGlobalQueueManager(location.pathname)) {
    console.log('[ConditionalGlobalQueueManager] Skipping GlobalQueueManager for route:', location.pathname);
    return null;
  }
  
  console.log('[ConditionalGlobalQueueManager] Rendering AlertQueueManager for route:', location.pathname);
  return <AlertQueueManager />;
};

export default ConditionalGlobalQueueManager;