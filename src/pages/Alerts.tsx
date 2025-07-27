import { useParams } from "react-router-dom";
import { useQueueData } from "@/hooks/useQueueData";
import AlertDisplay from "@/components/alerts/AlertDisplay";
import AlertQueueManager from "@/components/alerts/AlertQueueManager";
import QueueControlHandler from "@/components/alerts/url-handlers/QueueControlHandler";
import AlertTriggerHandler from "@/components/alerts/url-handlers/AlertTriggerHandler";

const Alerts = () => {
  const { alertSlug, username, action, giftCount } = useParams();
  const { queueData, refetch } = useQueueData();

  // Find the currently playing alert
  const currentAlert = queueData?.find(item => item.status === 'playing');

  // Log the current state for debugging
  console.log('[Alerts] Current queue state:', {
    queueData: queueData?.length || 0,
    currentAlert: currentAlert?.id || 'none',
    statuses: queueData?.map(item => `${item.id.slice(0,8)}: ${item.status}`)
  });

  return (
    <>
      <QueueControlHandler action={action} />
      <AlertTriggerHandler alertSlug={alertSlug} username={username} giftCount={giftCount} />
      {/* Server-side processing handles queue management automatically */}
      {currentAlert ? (
        <AlertDisplay currentAlert={currentAlert} />
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent pointer-events-none">
          <div className="text-white/50 text-sm">No active alerts</div>
        </div>
      )}
    </>
  );
};

export default Alerts;