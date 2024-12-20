import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

class TwitchConnection {
  private ws: WebSocket | null = null;
  private pingInterval: number | null = null;
  private lastPingSent: number = 0;
  private lastMessageReceived: number = 0;

  constructor() {
    console.log("[TwitchConnection] Initializing connection handler");
  }

  async connect(): Promise<WebSocket> {
    console.log("[TwitchConnection] Starting new WebSocket connection");
    
    if (this.ws) {
      console.log("[TwitchConnection] Closing existing connection");
      this.ws.close();
      this.clearTimers();
    }

    this.ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443/");
    return this.ws;
  }

  setupPingInterval(ws: WebSocket) {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    this.pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const now = Date.now();
        if (now - this.lastMessageReceived > 60000 && now - this.lastPingSent > 30000) {
          console.log("[TwitchConnection] Sending PING to maintain connection");
          ws.send("PING :tmi.twitch.tv");
          this.lastPingSent = now;
        }
      } else {
        console.log("[TwitchConnection] WebSocket not open during ping interval");
        this.clearTimers();
      }
    }, 30000) as unknown as number;
  }

  messageReceived() {
    this.lastMessageReceived = Date.now();
  }

  clearTimers() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  disconnect() {
    console.log("[TwitchConnection] Disconnecting...");
    this.clearTimers();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

class TwitchAuthenticator {
  constructor(
    private channel: string,
    private accessToken: string
  ) {
    console.log("[TwitchAuthenticator] Initializing for channel:", channel);
  }

  authenticate(ws: WebSocket) {
    console.log("[TwitchAuthenticator] Starting authentication sequence");
    
    const sendWithDelay = (message: string, delay: number) => {
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
          console.log("[TwitchAuthenticator] Sent command:", message);
        } else {
          console.error("[TwitchAuthenticator] WebSocket not open when trying to send:", message);
        }
      }, delay);
    };

    sendWithDelay("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership", 0);
    sendWithDelay(`PASS oauth:${this.accessToken}`, 1000);
    sendWithDelay(`NICK ${this.channel.toLowerCase()}`, 2000);
    sendWithDelay(`JOIN #${this.channel.toLowerCase()}`, 3000);
  }
}

class MessageHandler {
  constructor(private channel: string) {
    console.log("[MessageHandler] Initialized for channel:", channel);
  }

  async handleMessage(ws: WebSocket, message: string) {
    console.log("[MessageHandler] Processing message:", message);

    if (message.includes("PING")) {
      ws.send("PONG :tmi.twitch.tv");
      console.log("[MessageHandler] Responded to PING");
      return;
    }

    if (message.includes("Login authentication failed")) {
      console.error("[MessageHandler] Authentication failed");
      throw new Error("Login authentication failed");
    }

    if (message.includes(`JOIN #${this.channel}`)) {
      console.log("[MessageHandler] Successfully joined channel!");
    }
  }

  async sendMessage(ws: WebSocket, message: string) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("[MessageHandler] Cannot send message - WebSocket not ready");
      throw new Error("WebSocket not ready");
    }

    try {
      ws.send(`PRIVMSG #${this.channel} :${message}`);
      console.log("[MessageHandler] Message sent:", message);
    } catch (error) {
      console.error("[MessageHandler] Error sending message:", error);
      throw error;
    }
  }
}

class TwitchBot {
  private connection: TwitchConnection;
  private authenticator: TwitchAuthenticator;
  private messageHandler: MessageHandler;
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: number | null = null;

  constructor(config: { channel: string; accessToken: string }) {
    this.connection = new TwitchConnection();
    this.authenticator = new TwitchAuthenticator(config.channel, config.accessToken);
    this.messageHandler = new MessageHandler(config.channel);
  }

  async connect() {
    try {
      console.log("[TwitchBot] Starting connection process");
      
      this.ws = await this.connection.connect();
      this.setupWebSocketHandlers();
      
      return new Promise((resolve, reject) => {
        const connectionTimeout = setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            console.error("[TwitchBot] Connection timeout");
            this.handleConnectionError();
            reject(new Error("Connection timeout"));
          }
        }, 15000);

        this.ws!.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log("[TwitchBot] WebSocket connection established");
          this.connection.setupPingInterval(this.ws!);
          this.authenticator.authenticate(this.ws!);
          this.isConnected = true;
          resolve(true);
        };
      });
    } catch (error) {
      console.error("[TwitchBot] Error in connect method:", error);
      this.handleConnectionError();
      throw error;
    }
  }

  private setupWebSocketHandlers() {
    if (!this.ws) return;

    this.ws.onmessage = async (event) => {
      const message = event.data;
      this.connection.messageReceived();
      await this.messageHandler.handleMessage(this.ws!, message);
    };

    this.ws.onclose = () => {
      console.log("[TwitchBot] WebSocket connection closed");
      this.isConnected = false;
      this.handleConnectionError();
    };

    this.ws.onerror = (error) => {
      console.error("[TwitchBot] WebSocket error:", error);
      this.handleConnectionError();
    };
  }

  private handleConnectionError() {
    this.isConnected = false;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`[TwitchBot] Attempting to reconnect in ${delay/1000} seconds (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(async () => {
        this.reconnectAttempts++;
        try {
          await this.connect();
        } catch (error) {
          console.error("[TwitchBot] Reconnection attempt failed:", error);
        }
      }, delay) as unknown as number;
    } else {
      console.error("[TwitchBot] Max reconnection attempts reached");
      this.reconnectAttempts = 0;
    }
  }

  async sendMessage(message: string) {
    await this.messageHandler.sendMessage(this.ws!, message);
  }

  async disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.connection.disconnect();
    this.ws = null;
    this.isConnected = false;
  }

  getStatus(): string {
    return this.isConnected && 
           this.ws?.readyState === WebSocket.OPEN ? "Connected" : "Disconnected";
  }
}

const getOAuthToken = async (clientId: string, clientSecret: string) => {
  try {
    console.log("[TwitchAuth] Starting OAuth token request process");
    
    if (!clientId || !clientSecret) {
      throw new Error("Missing client ID or secret");
    }

    console.log("[TwitchAuth] Making OAuth token request");
    
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope: 'chat:read chat:edit'
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[TwitchAuth] OAuth token error response:", errorText);
      throw new Error(`Failed to get OAuth token: ${tokenResponse.status} ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error("[TwitchAuth] OAuth response missing access token:", tokenData);
      throw new Error('OAuth response missing access token');
    }

    console.log("[TwitchAuth] Successfully obtained OAuth token");
    return tokenData.access_token;
  } catch (error) {
    console.error("[TwitchAuth] Error getting OAuth token:", error);
    throw error;
  }
};

let botInstance: TwitchBot | null = null;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, message } = await req.json();
    console.log(`[TwitchBot] Received ${action} request with message:`, message);

    const config = {
      channel: Deno.env.get("TWITCH_CHANNEL_NAME"),
      clientId: Deno.env.get("TWITCH_CLIENT_ID"),
      clientSecret: Deno.env.get("TWITCH_CLIENT_SECRET"),
    };

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
        const accessToken = await getOAuthToken(config.clientId, config.clientSecret);
        botInstance = new TwitchBot({ channel: config.channel, accessToken });
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