import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EditAlertDialog from "../EditAlertDialog";
import { Alert } from "@/hooks/useAlerts";

interface AlertActionsProps {
  selectedAlert: Alert;
  onAlertDeleted: () => void;
}

const AlertActions = ({ selectedAlert, onAlertDeleted }: AlertActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      console.log('[AlertActions] Starting alert deletion process for:', selectedAlert.title);
      
      // First, delete any queue entries for this alert
      const { error: queueError } = await supabase
        .from('alert_queue')
        .delete()
        .eq('alert_id', selectedAlert.id);

      if (queueError) {
        console.error('[AlertActions] Error deleting queue entries:', queueError);
        toast({
          title: "Error",
          description: `Failed to delete alert queue entries: ${queueError.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('[AlertActions] Successfully deleted queue entries, now deleting alert');

      // Then delete the alert itself
      const { error: alertError } = await supabase
        .from('alerts')
        .delete()
        .eq('id', selectedAlert.id);

      if (alertError) {
        console.error('[AlertActions] Error deleting alert:', alertError);
        toast({
          title: "Error",
          description: `Failed to delete alert: ${alertError.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('[AlertActions] Alert deleted successfully');
      toast({
        title: "Success",
        description: "Alert deleted successfully",
      });
      
      localStorage.removeItem('selectedAlertId');
      onAlertDeleted();
    } catch (error) {
      console.error('[AlertActions] Unexpected error deleting alert:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the alert",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
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

      <EditAlertDialog
        alert={selectedAlert}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onAlertUpdated={onAlertDeleted}
      />
    </>
  );
};

export default AlertActions;