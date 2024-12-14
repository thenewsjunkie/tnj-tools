import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAlertQueue = () => {
  const [currentAlert, setCurrentAlert] = useState<any>(null);

  useEffect(() => {
    const channel = supabase.channel('alerts');

    channel
      .on('broadcast', { event: 'play_alert' }, ({ payload }) => {
        console.log('Received alert:', payload);
        setCurrentAlert(payload);
      })
      .subscribe((status) => {
        console.log('Channel status:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleAlertComplete = async () => {
    // Mark the current alert as completed in the queue
    const { data: queueData } = await supabase
      .from('alert_queue')
      .select('id')
      .eq('status', 'playing')
      .single();

    if (queueData) {
      await supabase
        .from('alert_queue')
        .update({ 
          status: 'completed',
          played_at: new Date().toISOString()
        })
        .eq('id', queueData.id);

      // Notify that the alert is completed
      await supabase
        .channel('alert-queue')
        .send({
          type: 'broadcast',
          event: 'alert_completed',
          payload: { id: queueData.id }
        });
    }

    setCurrentAlert(null);
  };

  return {
    currentAlert,
    handleAlertComplete
  };
};