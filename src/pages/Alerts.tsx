import { useParams } from "react-router-dom";
import { AlertDisplay } from "@/components/alerts/AlertDisplay";
import { useAlertQueue } from "@/hooks/useAlertQueue";
import QueueControlHandler from "@/components/alerts/url-handlers/QueueControlHandler";
import AlertTriggerHandler from "@/components/alerts/url-handlers/AlertTriggerHandler";

const Alerts = () => {
  const { alertSlug, username, action, giftCount } = useParams();
  const { currentAlert, handleAlertComplete } = useAlertQueue();

  // Effect to log current alert state
  if (currentAlert) {
    console.log('[Alerts Page] Current alert state:', currentAlert);
    console.log('[Alerts Page] Alert media type:', currentAlert.alert.media_type);
    console.log('[Alerts Page] Alert media URL:', currentAlert.alert.media_url);
  }

  // Return early if no alert to display
  if (!currentAlert?.alert) {
    console.log('[Alerts Page] No current alert to display');
    return (
      <>
        <QueueControlHandler action={action} />
        {/* Only render AlertTriggerHandler if we're not on a queue control URL */}
        {!action && <AlertTriggerHandler alertSlug={alertSlug} username={username} giftCount={giftCount} />}
      </>
    );
  }

  console.log('[Alerts Page] Rendering alert:', currentAlert.alert.title);

  const displayAlert = {
    media_type: currentAlert.alert.media_type,
    media_url: currentAlert.alert.media_url,
    message_enabled: currentAlert.alert.message_enabled,
    message_text: currentAlert.username 
      ? `${currentAlert.username} ${currentAlert.alert.message_text}`
      : currentAlert.alert.message_text,
    font_size: currentAlert.alert.font_size,
    is_gift_alert: currentAlert.alert.is_gift_alert,
    gift_count: currentAlert.gift_count || 1, // Use the gift_count from the queue or default to 1
    gift_count_animation_speed: currentAlert.alert.gift_count_animation_speed,
    gift_text_color: currentAlert.alert.gift_text_color,
    gift_count_color: currentAlert.alert.gift_count_color
  };

  return (
    <>
      <QueueControlHandler action={action} />
      {!action && <AlertTriggerHandler alertSlug={alertSlug} username={username} giftCount={giftCount} />}
      <AlertDisplay
        currentAlert={displayAlert}
        onComplete={handleAlertComplete}
      />
    </>
  );
};

export default Alerts;