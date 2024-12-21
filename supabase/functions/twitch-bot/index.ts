import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { TwitchBot } from "./twitchBot.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

let botInstance: TwitchBot | null = null;

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
      console.error("[TwitchBot] Missing required environment variables");
      throw new Error("Missing Twitch configuration. Please check environment variables.");
    }

    if (action === "status") {
      const status = botInstance?.getStatus() === "Connected" ? "connected" : "disconnected";
      return new Response(
        JSON.stringify({ status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "start") {
      console.log("[TwitchBot] Starting bot with channel:", config.channel);
      
      if (botInstance) {
        console.log("[TwitchBot] Already running, stopping first...");
        await botInstance.disconnect();
      }

      // Create new bot instance
      botInstance = new TwitchBot(config);
      
      // Connect in the background to avoid timeout
      botInstance.connect().catch(error => {
        console.error("[TwitchBot] Connection error:", error);
        botInstance = null;
      });
      
      return new Response(
        JSON.stringify({ status: "Twitch bot starting" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "stop") {
      console.log("[TwitchBot] Stopping bot");
      if (botInstance) {
        await botInstance.disconnect();
        botInstance = null;
      }
      return new Response(
        JSON.stringify({ status: "Twitch bot stopped" }),
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