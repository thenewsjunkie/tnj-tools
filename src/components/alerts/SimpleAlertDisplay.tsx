import { useEffect, useState } from "react";
import SimpleAlertContent from "./display/SimpleAlertContent";
import { supabase } from "@/integrations/supabase/client";

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
  const [isCompleting, setIsCompleting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    console.log('[SimpleAlertDisplay] Alert mounted:', currentAlert.id);
    setIsVisible(true);
    setIsCompleting(false);
    
    return () => {
      console.log('[SimpleAlertDisplay] Alert unmounted:', currentAlert.id);
    };
  }, [currentAlert.id]);

  const handleComplete = async () => {
    if (isCompleting) {
      console.log('[SimpleAlertDisplay] Already completing, ignoring duplicate call');
      return;
    }
    
    setIsCompleting(true);
    setIsVisible(false);
    console.log('[SimpleAlertDisplay] Completing alert:', currentAlert.id);

    try {
      // Mark alert as completed in database
      const { error } = await supabase
        .from('alert_queue')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', currentAlert.id)
        .eq('status', 'playing'); // Only update if still playing

      if (error) {
        console.error('[SimpleAlertDisplay] Error completing alert:', error);
      } else {
        console.log('[SimpleAlertDisplay] Alert completed successfully');
      }
    } catch (error) {
      console.error('[SimpleAlertDisplay] Exception completing alert:', error);
    }
  };

  const handleError = (error: string) => {
    console.error('[SimpleAlertDisplay] Alert error:', error);
    handleComplete(); // Complete on error
  };

  // Transform alert data for SimpleAlertContent
  const transformedAlert = {
    id: currentAlert.id,
    mediaUrl: currentAlert.alert.media_url,
    mediaType: currentAlert.alert.media_type,
    messageEnabled: currentAlert.alert.message_enabled,
    messageText: currentAlert.alert.message_text,
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

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 transition-opacity duration-300">
      <SimpleAlertContent
        currentAlert={transformedAlert}
        onComplete={handleComplete}
        onError={handleError}
      />
    </div>
  );
};

export default SimpleAlertDisplay;