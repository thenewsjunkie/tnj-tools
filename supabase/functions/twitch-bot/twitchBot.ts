import { TwitchMessage, BotConfig } from "./types.ts";
import { forwardToWebhook } from "./webhook.ts";
import { authenticate, getOAuthToken } from "./auth.ts";
import { fetchAndStoreChannelEmotes } from "./emotes.ts";
import { parseMessage, parseSubscriptionMessage } from "./messageParser.ts";

export class TwitchBot {
  private ws: WebSocket | null = null;
  private channel: string;
  private clientId: string;
  private clientSecret: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private isConnected: boolean = false;
  private accessToken: string | null = null;

  constructor(config: BotConfig) {
    this.channel = config.channel.toLowerCase();
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    console.log("[TwitchBot] Constructor called with channel:", this.channel);
  }

  async connect() {
    try {
      console.log("[TwitchBot] Starting connection attempt...");
      
      this.accessToken = await getOAuthToken(this.clientId, this.clientSecret);
      await fetchAndStoreChannelEmotes(this.channel, this.accessToken, this.clientId);
      
      this.ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443/");
      this.setupWebSocketHandlers();
    } catch (error) {
      console.error("[TwitchBot] Error in connect method:", error);
      this.isConnected = false;
      throw error;
    }
  }

  private setupWebSocketHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log("[TwitchBot] WebSocket connection established");
      this.isConnected = true;
      const botUsername = "justinfan" + Math.floor(Math.random() * 100000);
      authenticate(this.ws!, this.accessToken!, botUsername, this.channel);
      this.reconnectAttempts = 0;
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

      if (message.includes("USERNOTICE")) {
        const subInfo = parseSubscriptionMessage(message);
        if (subInfo) {
          await forwardToWebhook({
            type: "subscription",
            username: subInfo.username,
            message: subInfo.message,
            channel: this.channel
          });
        }
        return;
      }

      if (message.includes("PRIVMSG")) {
        const parsedMessage = parseMessage(message);
        if (parsedMessage) {
          await forwardToWebhook({
            type: "chat",
            ...parsedMessage
          });
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
  }

  async sendMessage(message: string) {
    if (!this.ws || !this.isConnected) {
      console.error("[TwitchBot] Cannot send message - not connected");
      return;
    }

    try {
      this.ws.send(`PRIVMSG #${this.channel} :${message}`);
      console.log("[TwitchBot] Message sent to Twitch:", message);
    } catch (error) {
      console.error("[TwitchBot] Error sending message:", error);
      throw error;
    }
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

  async disconnect() {
    console.log("[TwitchBot] Disconnecting...");
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  getStatus(): string {
    return this.isConnected ? "Connected" : "Disconnected";
  }
}