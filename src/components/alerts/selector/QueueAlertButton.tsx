import { Button } from "@/components/ui/button";
import { Alert } from "@/hooks/useAlerts";

interface QueueAlertButtonProps {
  selectedAlert: Alert;
  onTemplateSelect?: () => void;
}

const QueueAlertButton = ({ selectedAlert, onTemplateSelect }: QueueAlertButtonProps) => {
  const handleClick = () => {
    if (selectedAlert.is_template && onTemplateSelect) {
      onTemplateSelect();
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