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
    const { action } = await req.json();
    console.log(`Received ${action} request`);

    if (action === "status") {
      const status = botInstance?.getStatus() === "Connected" ? "connected" : "disconnected";
      return new Response(
        JSON.stringify({ status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "start") {
      if (botInstance) {
        console.log("[TwitchBot] Already running, stopping first...");
        await botInstance.disconnect();
      }

      const config = { channel: "your_channel", clientId: "your_client_id", clientSecret: "your_client_secret" }; // Replace with actual config
      botInstance = new TwitchBot(config);
      await botInstance.connect();
      return new Response(
        JSON.stringify({ status: "Twitch bot started" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "stop") {
      if (botInstance) {
        await botInstance.disconnect();
        botInstance = null;
      }
      return new Response(
        JSON.stringify({ status: "Twitch bot stopped" }),
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
});
