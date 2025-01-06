import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import UsernameDialog from "../dialogs/UsernameDialog";
import MessageAlertDialog from "../dialogs/MessageAlertDialog";
import { Alert } from "@/hooks/useAlerts";

interface QueueAlertButtonProps {
  selectedAlert: Alert;
}

const QueueAlertButton = ({ selectedAlert }: QueueAlertButtonProps) => {
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isQueuing, setIsQueuing] = useState(false);
  const { toast } = useToast();

  const queueAlert = async (username?: string, giftCount?: number) => {
    if (isQueuing) return;
    setIsQueuing(true);

    try {
      // Normalize username to lowercase if provided
      const normalizedUsername = username?.toLowerCase();

      console.log('[QueueAlertButton] Queueing alert:', {
        title: selectedAlert.title,
        username: normalizedUsername,
        giftCount,
        isGiftAlert: selectedAlert.is_gift_alert
      });
      
      const { error } = await supabase
        .from('alert_queue')
        .insert({
          alert_id: selectedAlert.id,
          username: normalizedUsername,
          status: 'pending',
          gift_count: selectedAlert.is_gift_alert ? (giftCount || 1) : null
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
    if (selectedAlert.is_message_alert) {
      setIsMessageDialogOpen(true);
    } else if (selectedAlert.message_enabled || selectedAlert.is_gift_alert) {
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

      <MessageAlertDialog
        open={isMessageDialogOpen}
        onOpenChange={setIsMessageDialogOpen}
        selectedAlert={selectedAlert}
      />
    </>
  );
};

export default QueueAlertButton;