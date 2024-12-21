import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BotActionsProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const BotActions = ({ isLoading, setIsLoading }: BotActionsProps) => {
  const { toast } = useToast();

  const startBots = async () => {
    setIsLoading(true);
    try {
      // Start Restream bot
      const { data: restreamData, error: restreamError } = await supabase.functions.invoke('restream-bot', {
        body: { action: "start" }
      });

      if (restreamError) {
        throw new Error(`Failed to start Restream bot: ${restreamError.message}`);
      }

      // If auth is required, redirect to Restream OAuth
      if (restreamData.status === "auth_required") {
        window.location.href = restreamData.authUrl;
        return;
      }

      toast({
        title: "Chat bots started",
        description: "Successfully connected to chat services",
      });
    } catch (error) {
      console.error("[ChatSettings] Error starting bots:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start chat bots. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopBots = async () => {
    setIsLoading(true);
    try {
      const { error: restreamError } = await supabase.functions.invoke('restream-bot', {
        body: { action: "stop" }
      });

      if (restreamError) {
        throw new Error(`Failed to stop Restream bot: ${restreamError.message}`);
      }

      toast({
        title: "Chat bots stopped",
        description: "Successfully disconnected from chat services",
      });
    } catch (error) {
      console.error("[ChatSettings] Error stopping bots:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to stop chat bots. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-4">
      <Button
        variant="outline"
        className="bg-black text-white border-gray-700 hover:bg-gray-800"
        onClick={startBots}
        disabled={isLoading}
      >
        <Play className="h-4 w-4 mr-2" />
        Start Bots
      </Button>
      <Button
        variant="outline"
        className="bg-black text-white border-gray-700 hover:bg-gray-800"
        onClick={stopBots}
        disabled={isLoading}
      >
        <Square className="h-4 w-4 mr-2" />
        Stop Bots
      </Button>
    </div>
  );
};