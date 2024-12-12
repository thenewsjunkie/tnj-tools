import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

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
}

const AlertButton = ({ alert }: AlertButtonProps) => {
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [username, setUsername] = useState("");

  const handleClick = async () => {
    if (alert.message_enabled) {
      setIsNameDialogOpen(true);
    } else {
      sendAlert();
    }
  };

  const sendAlert = async (name?: string) => {
    const alertData = {
      ...alert,
      message_text: name ? `${name} ${alert.message_text}` : alert.message_text,
    };

    const response = await supabase
      .channel('alerts')
      .send({
        type: 'broadcast',
        event: 'play_alert',
        payload: alertData
      });

    if (response !== 'ok') {
      console.error('Error sending alert');
    }

    setIsNameDialogOpen(false);
    setUsername("");
  };

  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault();
    sendAlert(username);
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="w-full"
        onClick={handleClick}
      >
        {alert.title}
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
    </>
  );
};

export default AlertButton;