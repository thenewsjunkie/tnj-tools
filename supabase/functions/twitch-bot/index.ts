import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { TwitchBot } from "./twitchBot.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

let botInstance: TwitchBot | null = null;
let lastHeartbeat: number = Date.now();
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();
    console.log(`[TwitchBot] Received ${action} request`);

    // Get config from environment variables
    const config = {
      channel: Deno.env.get("TWITCH_CHANNEL_NAME"),
      clientId: Deno.env.get("TWITCH_CLIENT_ID"),
      clientSecret: Deno.env.get("TWITCH_CLIENT_SECRET"),
    };

    // Validate config
    if (!config.channel || !config.clientId || !config.clientSecret) {
      throw new Error("Missing Twitch configuration. Please check environment variables.");
    }

    if (action === "status") {
      // Update heartbeat timestamp
      lastHeartbeat = Date.now();
      
      // Check if bot needs to be restarted
      if (botInstance && Date.now() - lastHeartbeat > HEARTBEAT_INTERVAL * 2) {
        console.log("[TwitchBot] Bot appears inactive, attempting restart...");
        await botInstance.disconnect();
        botInstance = null;
      }

      const status = botInstance?.getStatus() || "disconnected";
      return new Response(
        JSON.stringify({ status, lastHeartbeat }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "start") {
      if (botInstance) {
        console.log("[TwitchBot] Stopping existing instance...");
        await botInstance.disconnect();
      }

      console.log("[TwitchBot] Creating new bot instance...");
      botInstance = new TwitchBot(config);
      
      try {
        await botInstance.connect();
        lastHeartbeat = Date.now();
        
        return new Response(
          JSON.stringify({ status: "connected", lastHeartbeat }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("[TwitchBot] Connection error:", error);
        botInstance = null;
        throw error;
      }
    }

    if (action === "stop") {
      console.log("[TwitchBot] Stopping bot");
      if (botInstance) {
        await botInstance.disconnect();
        botInstance = null;
      }
      return new Response(
        JSON.stringify({ status: "stopped" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error("[TwitchBot] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});