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
  const { isPaused } = useQueueState();
  const { toast } = useToast();

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
    console.log('[AlertTriggerHandler] Component mounted. Alert slug:', alertSlug, 'Username:', username, 'Gift Count:', giftCount);
    
    const triggerAlertFromUrl = async () => {
      if (!alertSlug || completingRef.current || alertSlug === 'queue') {
        console.log('[AlertTriggerHandler] No alert slug, already completing, or queue control URL');
        return;
      }

      if (isPaused) {
        console.log('[AlertTriggerHandler] Queue is paused, not triggering alert');
        toast({
          title: "Queue Paused",
          description: "Cannot trigger alerts while the queue is paused",
          variant: "destructive",
        });
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

        // Add to queue
        const { error: queueError } = await supabase
          .from('alert_queue')
          .insert({
            alert_id: matchingAlert.id,
            username: username ? formatUsername(username) : null,
            gift_count: parsedGiftCount,
            status: 'pending'
          });

        if (queueError) {
          console.error('[AlertTriggerHandler] Error queueing alert:', queueError);
          toast({
            title: "Error",
            description: "Failed to queue alert",
            variant: "destructive",
          });
        } else {
          console.log('[AlertTriggerHandler] Alert queued successfully with gift count:', parsedGiftCount);
          toast({
            title: "Alert Queued",
            description: "Alert has been added to the queue",
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
  }, [alertSlug, username, giftCount, isPaused, toast]);

  return null;
};

export default AlertTriggerHandler;