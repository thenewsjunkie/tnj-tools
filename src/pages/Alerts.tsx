import { useParams } from "react-router-dom";
import { useQueueData } from "@/hooks/useQueueData";
import SimpleAlertDisplay from "@/components/alerts/SimpleAlertDisplay";
import QueueControlHandler from "@/components/alerts/url-handlers/QueueControlHandler";
import AlertTriggerHandler from "@/components/alerts/url-handlers/AlertTriggerHandler";

const Alerts = () => {
  const { alertSlug, username, action, giftCount } = useParams();
  const { queueData } = useQueueData();

  // Find the currently playing alert
  const currentAlert = queueData?.find(item => item.status === 'playing');

  // Handle URL-based actions
  if (action) {
    return (
      <>
        <QueueControlHandler action={action} />
        <AlertTriggerHandler alertSlug={alertSlug} username={username} giftCount={giftCount} />
      </>
    );
  }

  if (!currentAlert) {
    return (
      <>
        <QueueControlHandler action={action} />
        <AlertTriggerHandler alertSlug={alertSlug} username={username} giftCount={giftCount} />
      </>
    );
  }

  return (
    <>
      <QueueControlHandler action={action} />
      <AlertTriggerHandler alertSlug={alertSlug} username={username} giftCount={giftCount} />
      <SimpleAlertDisplay currentAlert={currentAlert} />
    </>
  );
};

export default Alerts;