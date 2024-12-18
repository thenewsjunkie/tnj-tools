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
      // Send authentication commands
      this.ws?.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
      this.ws?.send(`PASS oauth:${this.clientSecret}`);
      this.ws?.send(`NICK ${this.channelName}`);
      this.ws?.send(`JOIN #${this.channelName}`);
      
      // Log successful connection
      console.log(`Joined channel: #${this.channelName}`);
    };

    this.ws.onmessage = async (event) => {
      const message = event.data;
      console.log("Received message:", message); // Debug log

      if (message.includes("PING")) {
        this.ws?.send("PONG :tmi.twitch.tv");
        return;
      }

      // Handle authentication failures
      if (message.includes("Login authentication failed")) {
        console.error("Login authentication failed. Check your credentials.");
        return;
      }

      if (message.includes("PRIVMSG")) {
        console.log("Processing chat message:", message); // Debug log
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
      console.log("Parsing message:", rawMessage); // Debug log
      const regex = /.*:([^!]+).*PRIVMSG #([^ ]+) :(.+)/;
      const match = rawMessage.match(regex);
      if (match) {
        const message = {
          username: match[1],
          channel: match[2],
          message: match[3].trim(),
        };
        console.log("Parsed message:", message); // Debug log
        return message;
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
    return null;
  }

  private async forwardToWebhook(message: TwitchMessage) {
    try {
      console.log("Forwarding message to webhook:", message); // Debug log
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

    console.log("Starting Twitch bot for channel:", channelName); // Debug log
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