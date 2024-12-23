import { useState } from "react";
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

  const handleAlertSelect = (alert: Alert) => {
    onAlertSelect(alert);
    setDropdownOpen(false);
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <div className="flex gap-2">
          <AlertButton 
            alert={selectedAlert} 
            onAlertDeleted={onAlertDeleted}
          />
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
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
  );
};

export default AlertSelector;