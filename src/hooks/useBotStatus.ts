import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useBotStatus = () => {
  const [isBotConnected, setIsBotConnected] = useState(false);

  useEffect(() => {
    const checkBotStatus = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('twitch-bot', {
          body: { action: "status" }
        });

        if (error) {
          console.error("[useBotStatus] Error checking bot status:", error);
          setIsBotConnected(false);
          return;
        }

        setIsBotConnected(data?.status === "connected");
      } catch (error) {
        console.error("[useBotStatus] Error checking bot status:", error);
        setIsBotConnected(false);
      }
    };

    checkBotStatus();
    const interval = setInterval(checkBotStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return isBotConnected;
};