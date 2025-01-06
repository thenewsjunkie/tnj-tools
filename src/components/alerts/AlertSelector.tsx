import { useEffect, useState } from "react";
import AlertDropdown from "./selector/AlertDropdown";
import AlertActions from "./selector/AlertActions";
import QueueAlertButton from "./selector/QueueAlertButton";
import AddAlertDialog from "./AddAlertDialog";
import { Alert } from "@/hooks/useAlerts";

interface AlertSelectorProps {
  selectedAlert: Alert;
  alerts: Alert[];
  onAlertSelect: (alert: Alert) => void;
  onAlertDeleted: () => void;
}

const AlertSelector = ({ 
  selectedAlert, 
  alerts, 
  onAlertSelect,
  onAlertDeleted 
}: AlertSelectorProps) => {
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  useEffect(() => {
    const savedAlertId = localStorage.getItem('selectedAlertId');
    if (savedAlertId && alerts) {
      const savedAlert = alerts.find(alert => alert.id === savedAlertId);
      if (savedAlert && savedAlert.id !== selectedAlert.id) {
        onAlertSelect(savedAlert);
      }
    }
  }, [alerts]);

  const handleAlertSelect = (alert: Alert) => {
    onAlertSelect(alert);
    localStorage.setItem('selectedAlertId', alert.id);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 flex gap-2">
          <AlertDropdown
            selectedAlert={selectedAlert}
            alerts={alerts}
            onAlertSelect={handleAlertSelect}
          />
          <AlertActions
            selectedAlert={selectedAlert}
            onAlertDeleted={onAlertDeleted}
          />
        </div>
      </div>

      <QueueAlertButton 
        selectedAlert={selectedAlert}
        onTemplateSelect={() => setIsTemplateDialogOpen(true)}
      />

      <AddAlertDialog
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
        onAlertAdded={() => {
          setIsTemplateDialogOpen(false);
        }}
        isTemplate={true}
        initialType={selectedAlert.media_type === 'message' ? 'message' : 'gift'}
      />
    </div>
  );
};

export default AlertSelector;