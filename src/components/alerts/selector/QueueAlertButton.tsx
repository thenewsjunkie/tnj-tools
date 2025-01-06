import { Button } from "@/components/ui/button";
import { Alert } from "@/hooks/useAlerts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface QueueAlertButtonProps {
  selectedAlert: Alert;
  onTemplateSelect?: () => void;
}

const QueueAlertButton = ({ selectedAlert, onTemplateSelect }: QueueAlertButtonProps) => {
  const { toast } = useToast();

  const handleClick = async () => {
    if (selectedAlert.is_template) {
      if (onTemplateSelect) {
        onTemplateSelect();
      }
    } else {
      // Queue the alert directly
      try {
        const { error } = await supabase
          .from('alert_queue')
          .insert({
            alert_id: selectedAlert.id,
            status: 'pending'
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Alert queued successfully",
        });
      } catch (error) {
        console.error('Error queueing alert:', error);
        toast({
          title: "Error",
          description: "Failed to queue alert",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Button 
      variant="outline"
      onClick={handleClick}
      className="w-full sm:w-auto"
    >
      {selectedAlert.is_template ? "Create Alert from Template" : "Queue Alert"}
    </Button>
  );
};

export default QueueAlertButton;