import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AlertButton from "./AlertButton";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load selected alert from localStorage on mount
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
    // Save selected alert ID to localStorage
    localStorage.setItem('selectedAlertId', alert.id);
    setDropdownOpen(false);
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        className="flex-1"
        onClick={() => {}}
      >
        {selectedAlert.title}
      </Button>
      
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[200px] bg-background border-border"
        >
          {alerts?.map((alert) => (
            <Button
              key={alert.id}
              variant="ghost"
              className="w-full justify-start px-2 py-1.5 text-sm"
              onClick={() => handleAlertSelect(alert)}
            >
              {alert.title}
            </Button>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertButton 
        alert={selectedAlert} 
        onAlertDeleted={() => {
          localStorage.removeItem('selectedAlertId');
          onAlertDeleted();
          // After deletion, if there are other alerts, select the first one
          if (alerts && alerts.length > 0 && alerts[0].id !== selectedAlert.id) {
            onAlertSelect(alerts[0]);
            localStorage.setItem('selectedAlertId', alerts[0].id);
          }
        }}
      />
    </div>
  );
};

export default AlertSelector;