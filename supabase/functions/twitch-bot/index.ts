import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { TwitchBot } from "./twitchBot.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Create a global bot instance
let bot: TwitchBot | null = null;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const channelName = Deno.env.get("TWITCH_CHANNEL_NAME");
    const clientId = Deno.env.get("TWITCH_CLIENT_ID");
    const clientSecret = Deno.env.get("TWITCH_CLIENT_SECRET");

    if (!channelName || !clientId || !clientSecret) {
      throw new Error("Missing required environment variables");
    }

    // If it's a GET request, return the bot status
    if (req.method === "GET") {
      const status = bot ? bot.getStatus() : "Not initialized";
      return new Response(
        JSON.stringify({ status, channelName }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log("Starting Twitch bot with config:", {
      channelName,
      clientId: "***" + clientId.slice(-4),
      clientSecret: "***" + clientSecret.slice(-4)
    });

    // Create new bot instance if it doesn't exist
    if (!bot) {
      bot = new TwitchBot({ channelName, clientId, clientSecret });
      await bot.connect();
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Twitch bot started",
        channelName: channelName
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error starting Twitch bot:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});