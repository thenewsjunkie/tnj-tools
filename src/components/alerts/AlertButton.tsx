import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import EditAlertDialog from "./EditAlertDialog";
import UsernameDialog from "./dialogs/UsernameDialog";
import { useToast } from "@/components/ui/use-toast";

interface AlertButtonProps {
  alert: {
    id: string;
    title: string;
    media_url: string;
    media_type: string;
    message_enabled?: boolean;
    message_text?: string;
    font_size?: number;
  };
  onAlertDeleted?: () => void;
}

const AlertButton = ({ alert, onAlertDeleted }: AlertButtonProps) => {
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isQueuing, setIsQueuing] = useState(false);
  const { toast } = useToast();

  const handleClick = () => {
    if (alert.message_enabled) {
      setIsNameDialogOpen(true);
    } else {
      queueAlert();
    }
  };

  const queueAlert = async (username?: string) => {
    if (isQueuing) return; // Prevent double-queueing
    setIsQueuing(true);

    try {
      console.log('[AlertButton] Queueing alert:', alert.title);
      const { error } = await supabase
        .from('alert_queue')
        .insert({
          alert_id: alert.id,
          username,
          status: 'pending'
        });

      if (error) {
        console.error('[AlertButton] Error queueing alert:', error);
        toast({
          title: "Error",
          description: "Failed to queue alert",
          variant: "destructive",
        });
        return;
      }

      console.log('[AlertButton] Alert queued successfully');
      toast({
        title: "Success",
        description: "Alert queued successfully",
      });

      setIsNameDialogOpen(false);
    } finally {
      setIsQueuing(false);
    }
  };

  const handleDelete = async () => {
    console.log('[AlertButton] Deleting alert:', alert.title);
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', alert.id);

    if (error) {
      console.error('[AlertButton] Error deleting alert:', error);
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive",
      });
      return;
    }

    console.log('[AlertButton] Alert deleted successfully');
    toast({
      title: "Success",
      description: "Alert deleted successfully",
    });
    
    if (onAlertDeleted) {
      onAlertDeleted();
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        className="flex-1"
        onClick={handleClick}
        disabled={isQueuing}
      >
        {alert.title}
      </Button>
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
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <UsernameDialog
        open={isNameDialogOpen}
        onOpenChange={setIsNameDialogOpen}
        onSubmit={queueAlert}
      />

      <EditAlertDialog
        alert={alert}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onAlertUpdated={onAlertDeleted}
      />
    </div>
  );
};

export default AlertButton;