import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueueState } from "@/hooks/useQueueState";
import { useToast } from "@/components/ui/use-toast";

interface AlertTriggerHandlerProps {
  alertSlug?: string;
  username?: string;
  giftCount?: string;
}

const AlertTriggerHandler = ({ alertSlug, username, giftCount }: AlertTriggerHandlerProps) => {
  const completingRef = useRef(false);
  const { toast } = useToast();

  // Function to convert title to slug
  const titleToSlug = (title: string) => {
    return title.toLowerCase().replace(/\s+/g, '-');
  };

  // Function to format username from URL
  const formatUsername = (username: string) => {
    // First decode any URL-encoded characters
    const decodedUsername = decodeURIComponent(username);
    // Then format with proper capitalization
    return decodedUsername.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  useEffect(() => {
    console.log('[AlertTriggerHandler] Component mounted. Alert slug:', alertSlug, 'Username:', username, 'Gift Count:', giftCount);
    
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
        
        // Parse gift count if provided and alert is a gift alert
        const parsedGiftCount = matchingAlert.is_gift_alert && giftCount ? 
          parseInt(giftCount, 10) : undefined;

        if (parsedGiftCount && isNaN(parsedGiftCount)) {
          console.error('[AlertTriggerHandler] Invalid gift count provided:', giftCount);
          return;
        }

        // Get repeat count and delay from the alert
        const repeatCount = matchingAlert.repeat_count || 1;
        const repeatDelay = matchingAlert.repeat_delay || 1000;

        console.log('[AlertTriggerHandler] Creating', repeatCount, 'queue entries with delay:', repeatDelay);

        // Create an array of queue entries based on repeat count
        const queueEntries = Array.from({ length: repeatCount }, (_, index) => ({
          alert_id: matchingAlert.id,
          username: username ? formatUsername(username) : null,
          gift_count: parsedGiftCount,
          status: 'pending',
          // Add delay based on position in sequence
          scheduled_for: new Date(Date.now() + (index * repeatDelay)).toISOString()
        }));

        // Insert all queue entries
        const { error: queueError } = await supabase
          .from('alert_queue')
          .insert(queueEntries);

        if (queueError) {
          console.error('[AlertTriggerHandler] Error queueing alerts:', queueError);
          toast({
            title: "Error",
            description: "Failed to queue alert",
            variant: "destructive",
          });
        } else {
          console.log('[AlertTriggerHandler] Alerts queued successfully');
          toast({
            title: "Alert Queued",
            description: `Alert will play ${repeatCount} times`,
          });
        }
      } else {
        console.log('[AlertTriggerHandler] No matching alert found for slug:', alertSlug);
        toast({
          title: "Alert Not Found",
          description: "No matching alert found for the provided URL",
          variant: "destructive",
        });
      }
    };

    triggerAlertFromUrl();
  }, [alertSlug, username, giftCount, toast]);

  return null;
};

export default AlertTriggerHandler;