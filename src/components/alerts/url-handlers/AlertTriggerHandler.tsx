import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AlertTriggerHandlerProps {
  alertSlug?: string;
  username?: string;
}

const AlertTriggerHandler = ({ alertSlug, username }: AlertTriggerHandlerProps) => {
  const completingRef = useRef(false);

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

  useEffect(() => {
    console.log('[AlertTriggerHandler] Component mounted. Alert slug:', alertSlug, 'Username:', username);
    
    const triggerAlertFromUrl = async () => {
      if (!alertSlug || completingRef.current || alertSlug === 'queue') {
        console.log('[AlertTriggerHandler] No alert slug, already completing, or queue control URL');
        return;
      }

      console.log('[AlertTriggerHandler] Attempting to trigger alert from URL:', alertSlug);
      
      const { data: alerts, error } = await supabase
        .from('alerts')
        .select('*');

      if (error) {
        console.error('[AlertTriggerHandler] Error fetching alerts:', error);
        return;
      }

      console.log('[AlertTriggerHandler] Fetched alerts:', alerts);

      const matchingAlert = alerts.find(alert => titleToSlug(alert.title) === alertSlug);
      
      if (matchingAlert) {
        console.log('[AlertTriggerHandler] Found matching alert:', matchingAlert.title);
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
          console.error('[AlertTriggerHandler] Error queueing alert:', queueError);
        } else {
          console.log('[AlertTriggerHandler] Alert queued successfully');
        }
      } else {
        console.log('[AlertTriggerHandler] No matching alert found for slug:', alertSlug);
      }
    };

    triggerAlertFromUrl();
  }, [alertSlug, username]);

  return null;
};

export default AlertTriggerHandler;