import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3, ExternalLink, History, Power } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import CreatePollDialog from "./polls/CreatePollDialog";
import ActivePoll from "./polls/ActivePoll";

interface BotInstance {
  status: 'connected' | 'disconnected';
  type: string;
  error_message?: string | null;
}

export function LivePoll() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [botStatus, setBotStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch initial bot status
  useEffect(() => {
    const fetchBotStatus = async () => {
      const { data, error } = await supabase
        .from('bot_instances')
        .select('status, error_message')
        .eq('type', 'twitch')
        .maybeSingle();

      if (!error && data) {
        setBotStatus(data.status as 'connected' | 'disconnected');
        setErrorMessage(data.error_message);
      }
    };

    fetchBotStatus();

    // Subscribe to bot status changes
    const botSubscription = supabase
      .channel('bot-status')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bot_instances', filter: 'type=eq.twitch' },
        (payload) => {
          const newData = payload.new as BotInstance;
          if (newData) {
            setBotStatus(newData.status);
            setErrorMessage(newData.error_message);
            
            // Show toast for status changes
            if (newData.status === 'connected') {
              toast({
                title: "Twitch bot connected successfully",
                duration: 3000,
              });
            } else if (newData.error_message) {
              toast({
                title: "Twitch bot disconnected",
                description: newData.error_message,
                variant: "destructive",
                duration: 5000,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      botSubscription.unsubscribe();
    };
  }, [toast]);

  const toggleBot = async () => {
    try {
      setIsConnecting(true);
      setErrorMessage(null);
      const action = botStatus === 'connected' ? 'stop' : 'start';
      
      const { error } = await supabase.functions.invoke('twitch-bot', {
        body: { action }
      });

      if (error) throw error;

      toast({
        title: `Twitch bot ${action === 'start' ? 'connecting' : 'disconnecting'}...`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error toggling bot:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle bot connection';
      setErrorMessage(errorMessage);
      toast({
        title: "Failed to toggle bot connection",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
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
        {errorMessage && (
          <div className="text-sm text-red-500 mt-2">
            Error: {errorMessage}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ActivePoll />
      </CardContent>
    </Card>
  );
}