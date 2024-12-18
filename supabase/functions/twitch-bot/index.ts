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
  console.log("[Edge Function] Request received:", req.method, req.url);
  
  // Always add CORS headers for all responses
  const baseHeaders = {
    ...corsHeaders,
    "Content-Type": "application/json",
  };

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("[Edge Function] Handling OPTIONS request");
    return new Response(null, { headers: baseHeaders });
  }

  try {
    // Handle GET requests without authorization
    if (req.method === "GET") {
      console.log("[Edge Function] Processing GET request");
      const channelName = Deno.env.get("TWITCH_CHANNEL_NAME");
      const status = bot ? bot.getStatus() : "Not initialized";
      console.log("[Edge Function] GET request - Returning bot status:", status);
      
      return new Response(
        JSON.stringify({ status, channelName }),
        { headers: baseHeaders }
      );
    }

    // For all other requests, check environment variables and authorization
    const channelName = Deno.env.get("TWITCH_CHANNEL_NAME");
    const clientId = Deno.env.get("TWITCH_CLIENT_ID");
    const clientSecret = Deno.env.get("TWITCH_CLIENT_SECRET");

    console.log("[Edge Function] Environment variables loaded:", {
      channelName: channelName ? "✓" : "✗",
      clientId: clientId ? "✓" : "✗",
      clientSecret: clientSecret ? "✓" : "✗",
      actualChannelName: channelName,
      actualClientId: clientId ? `${clientId.slice(0, 4)}...` : null
    });

    if (!channelName || !clientId || !clientSecret) {
      console.error("[Edge Function] Missing required environment variables");
      throw new Error("Missing required environment variables");
    }

    // Check authorization for non-GET requests
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("[Edge Function] Missing authorization header for POST request");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          headers: baseHeaders,
          status: 401,
        }
      );
    }

    console.log("[Edge Function] Starting Twitch bot with config:", {
      channelName,
      clientIdPrefix: clientId ? clientId.slice(0, 4) : null
    });

    // Create new bot instance if it doesn't exist
    if (!bot) {
      console.log("[Edge Function] Creating new bot instance");
      bot = new TwitchBot({ channelName, clientId, clientSecret });
      await bot.connect();
      console.log("[Edge Function] Bot connection initiated");
    } else {
      console.log("[Edge Function] Bot instance already exists");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Twitch bot started",
        channelName: channelName
      }),
      {
        headers: baseHeaders,
        status: 200,
      }
    );
  } catch (error) {
    console.error("[Edge Function] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: baseHeaders,
        status: 500,
      }
    );
  }
});