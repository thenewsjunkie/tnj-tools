import { useParams } from "react-router-dom";
import { useQueueData } from "@/hooks/useQueueData";
import AlertDisplay from "@/components/alerts/AlertDisplay";
import AlertQueueManager from "@/components/alerts/AlertQueueManager";
import QueueControlHandler from "@/components/alerts/url-handlers/QueueControlHandler";
import AlertTriggerHandler from "@/components/alerts/url-handlers/AlertTriggerHandler";

const Alerts = () => {
  const { alertSlug, username, action, giftCount } = useParams();
  const { queueData } = useQueueData();

  // Find the currently playing alert
  const currentAlert = queueData?.find(item => item.status === 'playing');

  return (
    <>
      <QueueControlHandler action={action} />
      <AlertTriggerHandler alertSlug={alertSlug} username={username} giftCount={giftCount} />
      <AlertQueueManager />
      {currentAlert && <AlertDisplay currentAlert={currentAlert} />}
    </>
  );
};

export default Alerts;