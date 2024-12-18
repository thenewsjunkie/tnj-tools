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

        setStatus(data?.status === "connected" ? "connected" : "disconnected");
      } catch (error) {
        console.error(`[BotStatusIndicator] Error checking ${botType} status:`, error);
        setStatus("disconnected");
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [botType, setStatus]);

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
    </div>
  );
};

export default BotStatusIndicator;