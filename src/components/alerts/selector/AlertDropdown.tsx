import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert } from "@/hooks/useAlerts";

interface AlertDropdownProps {
  selectedAlert: Alert;
  alerts: Alert[];
  onAlertSelect: (alert: Alert) => void;
}

const AlertDropdown = ({ selectedAlert, alerts, onAlertSelect }: AlertDropdownProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleAlertSelect = (alert: Alert) => {
    onAlertSelect(alert);
    localStorage.setItem('selectedAlertId', alert.id);
    setDropdownOpen(false);
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex-1 justify-between"
        >
          <span className="truncate">{selectedAlert.title}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
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

export default AlertDropdown;