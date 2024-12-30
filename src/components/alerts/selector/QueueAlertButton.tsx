import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import UsernameDialog from "../dialogs/UsernameDialog";
import { Alert } from "@/hooks/useAlerts";

interface QueueAlertButtonProps {
  selectedAlert: Alert;
}

const QueueAlertButton = ({ selectedAlert }: QueueAlertButtonProps) => {
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [isQueuing, setIsQueuing] = useState(false);
  const { toast } = useToast();

  const queueAlert = async (username?: string, giftCount?: number) => {
    if (isQueuing) return;
    setIsQueuing(true);

    try {
      console.log('[QueueAlertButton] Queueing alert:', selectedAlert.title);
      
      const { error } = await supabase
        .from('alert_queue')
        .insert({
          alert_id: selectedAlert.id,
          username,
          status: 'pending',
          gift_count: giftCount // Store the gift count in the queue
        });

      if (error) {
        console.error('[QueueAlertButton] Error queueing alert:', error);
        toast({
          title: "Error",
          description: "Failed to queue alert",
          variant: "destructive",
        });
        return;
      }

      console.log('[QueueAlertButton] Alert queued successfully');
      toast({
        title: "Success",
        description: "Alert queued successfully",
      });

      setIsNameDialogOpen(false);
    } finally {
      setIsQueuing(false);
    }
  };

  const handleClick = () => {
    if (selectedAlert.message_enabled) {
      setIsNameDialogOpen(true);
    } else {
      queueAlert();
    }
  };

  return (
    <>
      <Button 
        variant="outline"
        onClick={handleClick}
        disabled={isQueuing}
        className="w-full sm:w-auto"
      >
        Queue Alert
      </Button>

      <UsernameDialog
        open={isNameDialogOpen}
        onOpenChange={setIsNameDialogOpen}
        onSubmit={queueAlert}
        isGiftAlert={selectedAlert.is_gift_alert}
      />
    </>
  );
};

export default QueueAlertButton;