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
  private connectionTimeout: number | null = null;
  private pingInterval: number | null = null;
  private lastPingSent: number = 0;

  constructor(config: BotConfig) {
    this.channel = config.channel.toLowerCase();
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    console.log("[TwitchBot] Constructor called with channel:", this.channel);
  }

  private clearTimers() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  async connect() {
    try {
      console.log("[TwitchBot] Starting connection attempt...");
      this.clearTimers();
      
      if (!this.accessToken) {
        this.accessToken = await getOAuthToken(this.clientId, this.clientSecret);
        console.log("[TwitchBot] OAuth token obtained successfully");
      }
      
      if (this.ws) {
        console.log("[TwitchBot] Closing existing WebSocket connection");
        this.ws.close();
        this.ws = null;
      }

      this.ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443/");
      this.setupWebSocketHandlers();
      
      return new Promise((resolve, reject) => {
        this.connectionTimeout = setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            console.error("[TwitchBot] Connection timeout");
            this.handleConnectionError();
            reject(new Error("Connection timeout"));
          }
        }, 15000) as unknown as number;

        this.ws!.onopen = () => {
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          console.log("[TwitchBot] WebSocket connection established");
          this.setupPingInterval();
          authenticate(this.ws!, this.accessToken!, this.channel, this.channel);
          resolve(true);
        };

        this.ws!.onerror = (error) => {
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

  private setupPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const now = Date.now();
        // Only send a PING if we haven't received any message in the last 60 seconds
        if (now - this.lastMessageReceived > 60000 && now - this.lastPingSent > 30000) {
          console.log("[TwitchBot] Sending PING to maintain connection");
          this.ws.send("PING :tmi.twitch.tv");
          this.lastPingSent = now;
        }
      } else {
        console.log("[TwitchBot] WebSocket not open during ping interval");
        this.handleConnectionError();
      }
    }, 30000) as unknown as number;
  }

  private handleConnectionError() {
    console.log("[TwitchBot] Handling connection error");
    this.isConnected = false;
    this.clearTimers();

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
      this.reconnectAttempts = 0; // Reset for next connection attempt
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
        this.accessToken = null; // Clear token to force new token on reconnect
        throw new Error("Login authentication failed");
      }

      if (message.includes(`JOIN #${this.channel}`)) {
        console.log("[TwitchBot] Successfully joined channel!");
        this.isConnected = true;
        this.reconnectAttempts = 0; // Reset attempts on successful connection
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
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("[TwitchBot] Cannot send message - WebSocket not initialized or not open");
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
    this.clearTimers();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  getStatus(): string {
    const isActive = this.isConnected && 
      this.ws?.readyState === WebSocket.OPEN &&
      (Date.now() - this.lastMessageReceived < 60000 || this.lastMessageReceived === 0);
    
    return isActive ? "Connected" : "Disconnected";
  }
}