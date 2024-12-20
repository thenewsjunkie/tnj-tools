import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { TwitchBot } from "./twitchBot.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

let botInstance: TwitchBot | null = null;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, message } = await req.json();
    console.log(`[TwitchBot] Received ${action} request with message:`, message);

    // Validate environment variables first
    const config = {
      channel: Deno.env.get("TWITCH_CHANNEL_NAME"),
      clientId: Deno.env.get("TWITCH_CLIENT_ID"),
      clientSecret: Deno.env.get("TWITCH_CLIENT_SECRET"),
    };

    // Log configuration (without sensitive data)
    console.log("[TwitchBot] Configuration check:", {
      hasChannel: !!config.channel,
      hasClientId: !!config.clientId,
      hasClientSecret: !!config.clientSecret
    });

    if (!config.channel || !config.clientId || !config.clientSecret) {
      const missingVars = [];
      if (!config.channel) missingVars.push("TWITCH_CHANNEL_NAME");
      if (!config.clientId) missingVars.push("TWITCH_CLIENT_ID");
      if (!config.clientSecret) missingVars.push("TWITCH_CLIENT_SECRET");
      
      throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
    }

    if (action === "status") {
      const status = botInstance?.getStatus() === "Connected" ? "connected" : "disconnected";
      console.log("[TwitchBot] Status check:", status);
      return new Response(
        JSON.stringify({ status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "start") {
      console.log("[TwitchBot] Starting bot with channel:", config.channel);
      
      if (botInstance) {
        console.log("[TwitchBot] Existing instance found, disconnecting first...");
        await botInstance.disconnect();
      }

      try {
        botInstance = new TwitchBot(config);
        await botInstance.connect();
        console.log("[TwitchBot] Bot successfully started");
        
        return new Response(
          JSON.stringify({ status: "Twitch bot started" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("[TwitchBot] Error during bot startup:", error);
        throw new Error(`Failed to start Twitch bot: ${error.message}`);
      }
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

    if (action === "send") {
      if (!message) {
        throw new Error("Message is required for send action");
      }

      if (!botInstance || botInstance.getStatus() !== "Connected") {
        throw new Error("Bot is not connected");
      }

      console.log("[TwitchBot] Sending message:", message);
      await botInstance.sendMessage(message);
      return new Response(
        JSON.stringify({ status: "Message sent" }),
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