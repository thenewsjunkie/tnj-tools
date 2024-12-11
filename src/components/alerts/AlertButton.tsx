import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface AlertButtonProps {
  alert: {
    id: string;
    title: string;
    media_url: string;
    media_type: string;
  };
}

const AlertButton = ({ alert }: AlertButtonProps) => {
  const handleClick = async () => {
    const response = await supabase
      .channel('alerts')
      .send({
        type: 'broadcast',
        event: 'play_alert',
        payload: alert
      });

    if (!response.ok) {
      console.error('Error sending alert:', response.error);
    }
  };

  return (
    <Button 
      variant="outline" 
      className="w-full"
      onClick={handleClick}
    >
      {alert.title}
    </Button>
  );
};

export default AlertButton;