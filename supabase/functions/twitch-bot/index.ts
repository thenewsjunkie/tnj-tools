import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { WebSocket } from "https://deno.land/x/websocket@v0.1.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TwitchMessage {
  username: string;
  message: string;
  channel: string;
}

class TwitchBot {
  private ws: WebSocket | null = null;
  private channelName: string;
  private clientId: string;
  private clientSecret: string;
  private webhookUrl: string;

  constructor(channelName: string, clientId: string, clientSecret: string) {
    this.channelName = channelName.toLowerCase();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/chat-webhooks`;
  }

  async connect() {
    console.log("Connecting to Twitch IRC...");
    this.ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

    this.ws.onopen = () => {
      console.log("Connected to Twitch IRC");
      this.ws?.send("CAP REQ :twitch.tv/tags twitch.tv/commands");
      this.ws?.send(`PASS oauth:${this.clientSecret}`);
      this.ws?.send(`NICK ${this.channelName}`);
      this.ws?.send(`JOIN #${this.channelName}`);
    };

    this.ws.onmessage = async (event) => {
      const message = event.data;
      if (message.includes("PING")) {
        this.ws?.send("PONG :tmi.twitch.tv");
        return;
      }

      if (message.includes("PRIVMSG")) {
        const parsedMessage = this.parseMessage(message);
        if (parsedMessage) {
          await this.forwardToWebhook(parsedMessage);
        }
      }
    };

    this.ws.onclose = () => {
      console.log("Disconnected from Twitch IRC");
      // Attempt to reconnect after a delay
      setTimeout(() => this.connect(), 5000);
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  private parseMessage(rawMessage: string): TwitchMessage | null {
    try {
      const regex = /.*:([^!]+).*PRIVMSG #([^ ]+) :(.+)/;
      const match = rawMessage.match(regex);
      if (match) {
        return {
          username: match[1],
          channel: match[2],
          message: match[3].trim(),
        };
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
    return null;
  }

  private async forwardToWebhook(message: TwitchMessage) {
    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        body: JSON.stringify({
          platform: "twitch",
          type: "chat",
          data: {
            username: message.username,
            message: message.message,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("Message forwarded successfully:", message);
    } catch (error) {
      console.error("Error forwarding message:", error);
    }
  }
}

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

    const bot = new TwitchBot(channelName, clientId, clientSecret);
    await bot.connect();

    return new Response(
      JSON.stringify({ success: true, message: "Twitch bot started" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error starting Twitch bot:", error);
    return new Response(
      JSON.stringify({ error: "Failed to start Twitch bot" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});