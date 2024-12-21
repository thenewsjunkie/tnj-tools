import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BotStatusIndicatorProps {
  botType: "twitch" | "youtube";
  icon: React.ReactNode;
  status: "connected" | "disconnected";
  setStatus: (status: "connected" | "disconnected") => void;
}

const BotStatusIndicator = ({ botType, icon, status, setStatus }: BotStatusIndicatorProps) => {
  const { toast } = useToast();
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data, error } = await supabase.functions.invoke(`${botType}-bot`, {
          body: { action: "status" }
        });

        if (error) {
          console.error(`[BotStatusIndicator] Error checking ${botType} status:`, error);
          setStatus("disconnected");
          return;
        }

        setLastCheck(new Date());
        const newStatus = data?.status === "connected" ? "connected" : "disconnected";
        
        // If status changed from connected to disconnected, show toast
        if (status === "connected" && newStatus === "disconnected") {
          toast({
            title: `${botType === "twitch" ? "Twitch" : "YouTube"} Bot Disconnected`,
            description: "Attempting to reconnect...",
            variant: "destructive",
          });
        }
        
        setStatus(newStatus);
      } catch (error) {
        console.error(`[BotStatusIndicator] Error checking ${botType} status:`, error);
        setStatus("disconnected");
      }
    };

    checkStatus();
    // Check status more frequently (every 10 seconds) to detect disconnections faster
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [botType, setStatus, status, toast]);

  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{botType === "twitch" ? "Twitch" : "YouTube"}:</span>
      <div
        className={`h-2 w-2 rounded-full ${
          status === "connected" ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className="text-sm text-gray-400">
        {status === "connected" ? "Connected" : "Disconnected"}
      </span>
      <span className="text-xs text-gray-400">
        (Last check: {lastCheck.toLocaleTimeString()})
      </span>
    </div>
  );
};

export default BotStatusIndicator;