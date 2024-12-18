import { TwitchMessage, BotConfig } from "./types.ts";
import { forwardToWebhook } from "./webhook.ts";

export class TwitchBot {
  private ws: WebSocket | null = null;
  private channel: string;
  private clientId: string;
  private clientSecret: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private isConnected: boolean = false;

  constructor(config: BotConfig) {
    this.channel = config.channel.toLowerCase();
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    console.log("[TwitchBot] Constructor called with channel:", this.channel);
  }

  async connect() {
    try {
      console.log("[TwitchBot] Starting connection attempt...");
      console.log("[TwitchBot] Connecting to channel:", this.channel);
      
      // Get OAuth token first
      const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get OAuth token');
      }

      const { access_token } = await tokenResponse.json();
      console.log("[TwitchBot] Successfully obtained OAuth token");
      
      this.ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

      this.ws.onopen = () => {
        console.log("[TwitchBot] WebSocket connection established");
        this.isConnected = true;
        this.authenticate(access_token);
      };

      this.ws.onmessage = async (event) => {
        const message = event.data;
        console.log("[TwitchBot] Received IRC message:", message);

        if (message.includes("PING")) {
          this.ws?.send("PONG :tmi.twitch.tv");
          console.log("[TwitchBot] Responded to PING");
          return;
        }

        if (message.includes("Login authentication failed")) {
          console.error("[TwitchBot] Login authentication failed. Check credentials.");
          return;
        }

        if (message.includes(`JOIN #${this.channel}`)) {
          console.log("[TwitchBot] Successfully joined channel!");
        }

        if (message.includes("PRIVMSG")) {
          console.log("[TwitchBot] Processing chat message:", message);
          const parsedMessage = this.parseMessage(message);
          if (parsedMessage) {
            await forwardToWebhook(parsedMessage);
          }
        }
      };

      this.ws.onclose = () => {
        console.log("[TwitchBot] WebSocket connection closed");
        this.isConnected = false;
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("[TwitchBot] WebSocket error:", error);
        this.isConnected = false;
      };
    } catch (error) {
      console.error("[TwitchBot] Error in connect method:", error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    console.log("[TwitchBot] Disconnecting...");
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  private authenticate(accessToken: string) {
    console.log("[TwitchBot] Sending authentication commands...");
    this.ws?.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
    this.ws?.send(`PASS oauth:${accessToken}`);
    this.ws?.send(`NICK ${this.channel}`);
    this.ws?.send(`JOIN #${this.channel}`);
    
    this.reconnectAttempts = 0;
    console.log("[TwitchBot] Authentication commands sent, waiting for channel join confirmation");
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[TwitchBot] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), 5000 * this.reconnectAttempts);
    } else {
      console.error("[TwitchBot] Max reconnection attempts reached");
    }
  }

  private parseMessage(rawMessage: string): TwitchMessage | null {
    try {
      console.log("[TwitchBot] Parsing message:", rawMessage);
      const regex = /.*:([^!]+).*PRIVMSG #([^ ]+) :(.+)/;
      const match = rawMessage.match(regex);
      if (match) {
        const message = {
          username: match[1],
          channel: match[2],
          message: match[3].trim(),
        };
        console.log("[TwitchBot] Successfully parsed message:", message);
        return message;
      }
    } catch (error) {
      console.error("[TwitchBot] Error parsing message:", error);
    }
    return null;
  }

  getStatus(): string {
    return this.isConnected ? "Connected" : "Disconnected";
  }
}