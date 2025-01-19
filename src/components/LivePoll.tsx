import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3, ExternalLink, History, Power } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CreatePollDialog from "./polls/CreatePollDialog";
import ActivePoll from "./polls/ActivePoll";

export function LivePoll() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [botStatus, setBotStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const { toast } = useToast();

  const handlePollCreated = () => {
    // Refresh will happen automatically through the subscription
  };

  const toggleBot = async () => {
    try {
      setIsConnecting(true);
      const action = botStatus === 'connected' ? 'stop' : 'start';
      
      const { error } = await supabase.functions.invoke('twitch-bot', {
        body: { action }
      });

      if (error) throw error;

      setBotStatus(action === 'start' ? 'connected' : 'disconnected');
      toast({
        title: `Twitch bot ${action === 'start' ? 'connected' : 'disconnected'}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error toggling bot:', error);
      toast({
        title: "Failed to toggle bot connection",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card className="dark:bg-black/50 dark:border-white/10">
      <CardHeader className="pb-4">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Live Poll
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleBot}
              disabled={isConnecting}
              className={`${
                botStatus === 'connected' 
                  ? 'text-green-500 hover:text-red-500' 
                  : 'text-red-500 hover:text-green-500'
              } dark:hover:bg-white/10 dark:border-white/10`}
            >
              <Power className="h-4 w-4" />
            </Button>
            <CreatePollDialog onPollCreated={handlePollCreated} />
            <Link to="/admin/polls">
              <Button
                variant="outline"
                size="icon"
                className="alert-icon hover:text-neon-red dark:hover:bg-white/10 dark:border-white/10"
              >
                <History className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/polls/obs">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 dark:hover:bg-white/10"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ActivePoll />
      </CardContent>
    </Card>
  );
}