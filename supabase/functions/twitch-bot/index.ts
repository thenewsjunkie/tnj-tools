import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { TwitchBot } from "./twitchBot.ts";
import { corsHeaders } from "./webhook.ts";

const TWITCH_CHANNEL = Deno.env.get("TWITCH_CHANNEL_NAME");
const TWITCH_CLIENT_ID = Deno.env.get("TWITCH_CLIENT_ID");
const TWITCH_CLIENT_SECRET = Deno.env.get("TWITCH_CLIENT_SECRET");

if (!TWITCH_CHANNEL || !TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
  console.error("Missing required environment variables");
  throw new Error("Missing required environment variables");
}

const bot = new TwitchBot({
  channel: TWITCH_CHANNEL,
  clientId: TWITCH_CLIENT_ID,
  clientSecret: TWITCH_CLIENT_SECRET,
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Start command
  if (req.method === "POST") {
    try {
      const { action } = await req.json();
      
      if (action === "start") {
        console.log("Starting Twitch bot...");
        await bot.connect();
        return new Response(
          JSON.stringify({ status: "Bot started successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (action === "stop") {
        console.log("Stopping Twitch bot...");
        await bot.disconnect();
        return new Response(
          JSON.stringify({ status: "Bot stopped successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (error) {
      console.error("Error:", error);
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