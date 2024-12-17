import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { AlertDisplay } from "@/components/alerts/AlertDisplay";
import { useAlertQueue } from "@/hooks/useAlertQueue";
import { useQueueState } from "@/hooks/useQueueState";

const Alerts = () => {
  const { alertSlug, username, action } = useParams();
  const completingRef = useRef(false);
  const { currentAlert, handleAlertComplete } = useAlertQueue();
  const { togglePause } = useQueueState();

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

  // Effect to handle queue control via URL
  useEffect(() => {
    const handleQueueControl = async () => {
      if (!action || !action.match(/^(play|stop)$/)) return;

      console.log('[Alerts Page] Queue control action:', action);
      
      const shouldPause = action === 'stop';
      const newState = await togglePause();
      
      // If the current state doesn't match what we want, toggle it
      if (newState === shouldPause) {
        console.log('[Alerts Page] Queue state already matches desired state');
        return;
      }
      
      await togglePause();
      console.log('[Alerts Page] Queue state updated to:', action === 'stop' ? 'paused' : 'playing');
    };

    handleQueueControl();
  }, [action, togglePause]);

  // Effect to handle URL-based alert triggering
  useEffect(() => {
    console.log('[Alerts Page] Component mounted. Alert slug:', alertSlug, 'Username:', username);
    
    const triggerAlertFromUrl = async () => {
      if (!alertSlug || completingRef.current || alertSlug === 'queue') {
        console.log('[Alerts Page] No alert slug, already completing, or queue control URL');
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

  // Effect to log current alert state
  useEffect(() => {
    if (currentAlert) {
      console.log('[Alerts Page] Current alert state:', currentAlert);
      console.log('[Alerts Page] Alert media type:', currentAlert.alert.media_type);
      console.log('[Alerts Page] Alert media URL:', currentAlert.alert.media_url);
    }
  }, [currentAlert]);

  // Return early if no alert to display
  if (!currentAlert?.alert) {
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
      onComplete={handleAlertComplete}
    />
  );
};

export default Alerts;