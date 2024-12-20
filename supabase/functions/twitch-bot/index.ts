import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { TwitchConnection } from "./connection.ts";
import { TwitchAuthenticator } from "./authenticator.ts";
import { getOAuthToken } from "./auth.ts";
import { validateConfig, TwitchConfig } from "./config.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

let botInstance: {
  connection: TwitchConnection;
  authenticator: TwitchAuthenticator;
  ws: WebSocket | null;
} | null = null;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action } = await req.json();
    console.log(`[TwitchBot] Received ${action} request`);

    const config: TwitchConfig = {
      channel: Deno.env.get("TWITCH_CHANNEL_NAME") || "",
      clientId: Deno.env.get("TWITCH_CLIENT_ID") || "",
      clientSecret: Deno.env.get("TWITCH_CLIENT_SECRET") || "",
    };

    try {
      validateConfig(config);
    } catch (error) {
      console.error("[TwitchBot] Configuration error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (action === "status") {
      const status = botInstance?.ws?.readyState === WebSocket.OPEN ? "connected" : "disconnected";
      console.log("[TwitchBot] Status check:", status);
      return new Response(
        JSON.stringify({ status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "start") {
      console.log("[TwitchBot] Starting bot with channel:", config.channel);
      
      if (botInstance?.ws?.readyState === WebSocket.OPEN) {
        console.log("[TwitchBot] Bot already running");
        return new Response(
          JSON.stringify({ status: "Bot already running" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      try {
        const accessToken = await getOAuthToken(config.clientId, config.clientSecret);
        console.log("[TwitchBot] Successfully obtained access token");

        const connection = new TwitchConnection();
        const authenticator = new TwitchAuthenticator(config.channel, accessToken, config.clientId);
        
        const ws = await connection.connect();
        console.log("[TwitchBot] WebSocket connection established");

        ws.onmessage = async (event) => {
          const message = event.data;
          connection.messageReceived();
          console.log("[TwitchBot] Received message:", message);

          if (message.includes("PING")) {
            ws.send("PONG :tmi.twitch.tv");
            return;
          }

          if (message.includes("Login authentication failed")) {
            console.error("[TwitchBot] Authentication failed");
            connection.disconnect();
            return;
          }
        };

        await authenticator.authenticate(ws);
        connection.setupPingInterval(ws);

        botInstance = { connection, authenticator, ws };
        
        return new Response(
          JSON.stringify({ status: "Bot started successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("[TwitchBot] Error starting bot:", error);
        if (botInstance) {
          botInstance.connection.disconnect();
          botInstance = null;
        }
        throw error;
      }
    }

    if (action === "stop") {
      console.log("[TwitchBot] Stopping bot");
      if (botInstance) {
        botInstance.connection.disconnect();
        botInstance = null;
      }
      return new Response(
        JSON.stringify({ status: "Bot stopped" }),
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