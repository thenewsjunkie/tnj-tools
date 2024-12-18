import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { TwitchBot } from "./twitchBot.ts";
import { corsHeaders } from "./webhook.ts";

const TWITCH_CHANNEL = Deno.env.get("TWITCH_CHANNEL_NAME");
const TWITCH_CLIENT_ID = Deno.env.get("TWITCH_CLIENT_ID");
const TWITCH_CLIENT_SECRET = Deno.env.get("TWITCH_CLIENT_SECRET");

if (!TWITCH_CHANNEL || !TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
  console.error("Missing required environment variables:", {
    TWITCH_CHANNEL: !!TWITCH_CHANNEL,
    TWITCH_CLIENT_ID: !!TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET: !!TWITCH_CLIENT_SECRET,
  });
  throw new Error("Missing required environment variables");
}

let bot: TwitchBot | null = null;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Status check
  if (req.method === "GET") {
    console.log("[TwitchBot] Status check requested");
    const status = bot?.getStatus() || "Not initialized";
    return new Response(
      JSON.stringify({ status }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Start/Stop commands
  if (req.method === "POST") {
    try {
      const { action } = await req.json();
      console.log("[TwitchBot] Received action:", action);
      
      if (action === "start") {
        console.log("[TwitchBot] Starting bot...");
        if (bot) {
          await bot.disconnect();
        }
        bot = new TwitchBot({
          channel: TWITCH_CHANNEL,
          clientId: TWITCH_CLIENT_ID,
          clientSecret: TWITCH_CLIENT_SECRET,
        });
        await bot.connect();
        return new Response(
          JSON.stringify({ status: "Bot started successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (action === "stop") {
        console.log("[TwitchBot] Stopping bot...");
        if (bot) {
          await bot.disconnect();
          bot = null;
        }
        return new Response(
          JSON.stringify({ status: "Bot stopped successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`Invalid action: ${action}`);
    } catch (error) {
      console.error("[TwitchBot] Error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    { 
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
});