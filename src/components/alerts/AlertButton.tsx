import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import EditAlertDialog from "./EditAlertDialog";
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
  const [username, setUsername] = useState("");
  const { toast } = useToast();

  const handleClick = async () => {
    if (alert.message_enabled) {
      setIsNameDialogOpen(true);
    } else {
      queueAlert();
    }
  };

  const queueAlert = async (name?: string) => {
    const { error } = await supabase
      .from('alert_queue')
      .insert({
        alert_id: alert.id,
        username: name
      });

    if (error) {
      console.error('Error queueing alert:', error);
      toast({
        title: "Error",
        description: "Failed to queue alert",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Alert queued successfully",
    });

    setIsNameDialogOpen(false);
    setUsername("");
  };

  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault();
    queueAlert(username);
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', alert.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive",
      });
      return;
    }

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

      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Username</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitName} className="space-y-4">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">Submit</Button>
          </form>
        </DialogContent>
      </Dialog>

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