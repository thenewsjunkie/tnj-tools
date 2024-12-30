import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Edit2, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditAlertDialog from "./EditAlertDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import UsernameDialog from "./dialogs/UsernameDialog";
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
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isQueuing, setIsQueuing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

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
    setDropdownOpen(false);
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      console.log('[AlertSelector] Deleting alert:', selectedAlert.title);
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', selectedAlert.id);

      if (error) {
        console.error('[AlertSelector] Error deleting alert:', error);
        toast({
          title: "Error",
          description: `Failed to delete alert: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('[AlertSelector] Alert deleted successfully');
      toast({
        title: "Success",
        description: "Alert deleted successfully",
      });
      
      localStorage.removeItem('selectedAlertId');
      onAlertDeleted();
      if (alerts && alerts.length > 0 && alerts[0].id !== selectedAlert.id) {
        onAlertSelect(alerts[0]);
        localStorage.setItem('selectedAlertId', alerts[0].id);
      }
    } catch (error) {
      console.error('[AlertSelector] Unexpected error deleting alert:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the alert",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const queueAlert = async (username?: string) => {
    if (isQueuing) return;
    setIsQueuing(true);

    try {
      console.log('[AlertSelector] Queueing alert:', selectedAlert.title);
      const { error } = await supabase
        .from('alert_queue')
        .insert({
          alert_id: selectedAlert.id,
          username,
          status: 'pending'
        });

      if (error) {
        console.error('[AlertSelector] Error queueing alert:', error);
        toast({
          title: "Error",
          description: "Failed to queue alert",
          variant: "destructive",
        });
        return;
      }

      console.log('[AlertSelector] Alert queued successfully');
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
    <div className="flex flex-col space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 flex gap-2">
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

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

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
      />

      <EditAlertDialog
        alert={selectedAlert}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onAlertUpdated={onAlertDeleted}
      />
    </div>
  );
};

export default AlertSelector;