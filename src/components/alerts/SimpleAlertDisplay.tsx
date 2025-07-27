import { useEffect } from "react";
import SimpleAlertContent from "./display/SimpleAlertContent";

interface SimpleAlertDisplayProps {
  currentAlert: {
    id: string;
    alert: {
      id: string;
      title: string;
      media_url: string;
      media_type: string;
      message_enabled: boolean;
      message_text?: string;
      display_duration?: number;
      repeat_count?: number;
      repeat_delay?: number;
      font_size?: number;
      text_color?: string;
      is_gift_alert?: boolean;
      gift_count_animation_speed?: number;
      gift_text_color?: string;
      gift_count_color?: string;
    };
    username?: string;
    gift_count?: number;
  };
}

const SimpleAlertDisplay = ({ currentAlert }: SimpleAlertDisplayProps) => {
  useEffect(() => {
    console.log('[SimpleAlertDisplay] Alert mounted:', currentAlert.id);
    return () => {
      console.log('[SimpleAlertDisplay] Alert unmounted:', currentAlert.id);
    };
  }, [currentAlert.id]);

  const handleError = (error: string) => {
    console.error('[SimpleAlertDisplay] Alert error:', error);
    // Server will handle completion automatically, no need for client-side completion
  };

  // Transform alert data for SimpleAlertContent
  const transformedAlert = {
    id: currentAlert.id,
    mediaUrl: currentAlert.alert.media_url,
    mediaType: currentAlert.alert.media_type,
    messageEnabled: currentAlert.alert.message_enabled,
    messageText: currentAlert.alert.message_text,
    username: currentAlert.username,
    displayDuration: currentAlert.alert.display_duration,
    repeatCount: currentAlert.alert.repeat_count,
    repeatDelay: currentAlert.alert.repeat_delay,
    fontSize: currentAlert.alert.font_size,
    textColor: currentAlert.alert.text_color,
    giftCount: currentAlert.gift_count,
    isGiftAlert: currentAlert.alert.is_gift_alert,
    giftCountAnimationSpeed: currentAlert.alert.gift_count_animation_speed,
    giftTextColor: currentAlert.alert.gift_text_color,
    giftCountColor: currentAlert.alert.gift_count_color,
  };

  return (
    <div className="fixed inset-0 z-50 transition-opacity duration-300">
      <SimpleAlertContent
        currentAlert={transformedAlert}
        onComplete={() => {
          // Server handles completion automatically via process-alert-queue edge function
          console.log('[SimpleAlertDisplay] Media finished, server will handle completion');
        }}
        onError={handleError}
      />
    </div>
  );
};

export default SimpleAlertDisplay;