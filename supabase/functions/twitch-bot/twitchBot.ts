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
  private lastMessageReceived: number = 0;
  private reconnectTimeout: number | null = null;

  constructor(config: BotConfig) {
    this.channel = config.channel.toLowerCase();
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    console.log("[TwitchBot] Constructor called with channel:", this.channel);
  }

  async connect() {
    try {
      console.log("[TwitchBot] Starting connection attempt...");
      
      // Clear any existing reconnect timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
      
      this.accessToken = await getOAuthToken(this.clientId, this.clientSecret);
      console.log("[TwitchBot] OAuth token obtained successfully");
      
      await fetchAndStoreChannelEmotes(this.channel, this.accessToken, this.clientId);
      
      if (this.ws) {
        console.log("[TwitchBot] Closing existing WebSocket connection");
        this.ws.close();
      }

      this.ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443/");
      this.setupWebSocketHandlers();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            console.error("[TwitchBot] Connection timeout");
            this.ws?.close();
            reject(new Error("Connection timeout"));
          }
        }, 10000);

        this.ws!.onopen = () => {
          clearTimeout(timeout);
          console.log("[TwitchBot] WebSocket connection established");
          this.isConnected = true;
          authenticate(this.ws!, this.accessToken!, this.channel, this.channel);
          this.reconnectAttempts = 0;
          resolve(true);
        };

        this.ws!.onerror = (error) => {
          clearTimeout(timeout);
          console.error("[TwitchBot] WebSocket error:", error);
          this.handleConnectionError();
          reject(error);
        };
      });
    } catch (error) {
      console.error("[TwitchBot] Error in connect method:", error);
      this.handleConnectionError();
      throw error;
    }
  }

  private handleConnectionError() {
    this.isConnected = false;
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`[TwitchBot] Attempting to reconnect in ${delay/1000} seconds (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      this.reconnectTimeout = setTimeout(() => this.connect(), delay);
      this.reconnectAttempts++;
    } else {
      console.error("[TwitchBot] Max reconnection attempts reached");
    }
  }

  private setupWebSocketHandlers() {
    if (!this.ws) return;

    this.ws.onmessage = async (event) => {
      const message = event.data;
      this.lastMessageReceived = Date.now();
      console.log("[TwitchBot] Received IRC message:", message);

      if (message.includes("PING")) {
        this.ws?.send("PONG :tmi.twitch.tv");
        console.log("[TwitchBot] Responded to PING");
        return;
      }

      if (message.includes("Login authentication failed")) {
        console.error("[TwitchBot] Login authentication failed");
        this.isConnected = false;
        throw new Error("Login authentication failed");
      }

      if (message.includes(`JOIN #${this.channel}`)) {
        console.log("[TwitchBot] Successfully joined channel!");
        this.isConnected = true;
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

    this.ws.onclose = (event) => {
      console.log("[TwitchBot] WebSocket connection closed", event);
      this.isConnected = false;
      this.handleConnectionError();
    };
  }

  async sendMessage(message: string) {
    if (!this.ws) {
      console.error("[TwitchBot] Cannot send message - WebSocket not initialized");
      throw new Error("Bot is not connected");
    }

    try {
      this.ws.send(`PRIVMSG #${this.channel} :${message}`);
      console.log("[TwitchBot] Message sent to Twitch:", message);
    } catch (error) {
      console.error("[TwitchBot] Error sending message:", error);
      throw error;
    }
  }

  async disconnect() {
    console.log("[TwitchBot] Disconnecting...");
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  getStatus(): string {
    const isActive = this.isConnected && 
      (Date.now() - this.lastMessageReceived < 60000 || this.lastMessageReceived === 0);
    
    return isActive ? "Connected" : "Disconnected";
  }
}