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
      console.log("[TwitchBot] OAuth token obtained successfully");
      
      await fetchAndStoreChannelEmotes(this.channel, this.accessToken, this.clientId);
      
      this.ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443/");
      this.setupWebSocketHandlers();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Connection timeout"));
        }, 10000);

        this.ws!.onopen = () => {
          clearTimeout(timeout);
          console.log("[TwitchBot] WebSocket connection established");
          this.isConnected = true;
          // Use the channel name as the bot username since we have its OAuth token
          authenticate(this.ws!, this.accessToken!, this.channel, this.channel);
          this.reconnectAttempts = 0;
          resolve(true);
        };

        this.ws!.onerror = (error) => {
          clearTimeout(timeout);
          console.error("[TwitchBot] WebSocket error:", error);
          this.isConnected = false;
          reject(error);
        };
      });
    } catch (error) {
      console.error("[TwitchBot] Error in connect method:", error);
      this.isConnected = false;
      throw error;
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

    this.ws.onclose = () => {
      console.log("[TwitchBot] WebSocket connection closed");
      this.isConnected = false;
      this.handleReconnect();
    };
  }

  async sendMessage(message: string) {
    if (!this.ws) {
      console.error("[TwitchBot] Cannot send message - WebSocket not initialized");
      throw new Error("Bot is not connected");
    }

    try {
      // Send message as the channel account
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
    // Consider the bot connected if we've received a message in the last minute
    // or if the connection is established but we haven't received any messages yet
    const isActive = this.isConnected && 
      (Date.now() - this.lastMessageReceived < 60000 || this.lastMessageReceived === 0);
    
    return isActive ? "Connected" : "Disconnected";
  }
}