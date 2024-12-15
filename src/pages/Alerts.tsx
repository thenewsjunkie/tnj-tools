import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { AlertDisplay } from "@/components/alerts/AlertDisplay";
import { useAlertQueue } from "@/hooks/useAlertQueue";

const Alerts = () => {
  const [showPlayButton, setShowPlayButton] = useState(false);
  const { alertSlug, username } = useParams();
  const completingRef = useRef(false);
  const { currentAlert, handleAlertComplete } = useAlertQueue();

  // Function to convert title to slug
  const titleToSlug = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, '-');
  };

  // Function to format username from URL
  const formatUsername = (username: string) => {
    return username.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Effect to handle URL-based alert triggering
  useEffect(() => {
    console.log('[Alerts Page] Component mounted. Alert slug:', alertSlug, 'Username:', username);
    
    const triggerAlertFromUrl = async () => {
      if (!alertSlug || completingRef.current) {
        console.log('[Alerts Page] No alert slug or already completing, skipping trigger');
        return;
      }

      console.log('[Alerts Page] Attempting to trigger alert from URL:', alertSlug);
      
      const { data: alerts, error } = await supabase
        .from('alerts')
        .select('*');

      if (error) {
        console.error('[Alerts Page] Error fetching alerts:', error);
        return;
      }

      console.log('[Alerts Page] Fetched alerts:', alerts);

      const matchingAlert = alerts.find(alert => titleToSlug(alert.title) === alertSlug);
      
      if (matchingAlert) {
        console.log('[Alerts Page] Found matching alert:', matchingAlert.title);
        completingRef.current = true;
        
        // Add to queue
        const { error: queueError } = await supabase
          .from('alert_queue')
          .insert({
            alert_id: matchingAlert.id,
            username: username ? formatUsername(username) : null,
            status: 'pending'
          });

        if (queueError) {
          console.error('[Alerts Page] Error queueing alert:', queueError);
        } else {
          console.log('[Alerts Page] Alert queued successfully');
        }
      } else {
        console.log('[Alerts Page] No matching alert found for slug:', alertSlug);
      }
    };

    triggerAlertFromUrl();
  }, [alertSlug, username]);

  useEffect(() => {
    console.log('[Alerts Page] Current alert state:', currentAlert);
  }, [currentAlert]);

  if (!currentAlert) {
    console.log('[Alerts Page] No current alert to display');
    return null;
  }

  console.log('[Alerts Page] Rendering alert:', currentAlert.alert.title);

  const displayAlert = {
    media_type: currentAlert.alert.media_type,
    media_url: currentAlert.alert.media_url,
    message_enabled: currentAlert.alert.message_enabled,
    message_text: currentAlert.username 
      ? `${currentAlert.username} ${currentAlert.alert.message_text}`
      : currentAlert.alert.message_text,
    font_size: currentAlert.alert.font_size
  };

  return (
    <AlertDisplay
      currentAlert={displayAlert}
      showPlayButton={showPlayButton}
      setShowPlayButton={setShowPlayButton}
      onComplete={handleAlertComplete}
    />
  );
};

export default Alerts;