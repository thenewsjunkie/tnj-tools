import { BotConfig } from "./types.ts";

export class TwitchConnection {
  private ws: WebSocket | null = null;
  private heartbeatInterval: number | null = null;
  private lastPong: Date | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  config: BotConfig;

  constructor(
    config: BotConfig,
    private onMessage: (message: string) => void,
    private onConnectionChange: (status: boolean) => void
  ) {
    this.config = config;
  }

  async connect(accessToken: string, username: string, channel: string) {
    try {
      if (!accessToken || !username || !channel) {
        console.error("[TwitchConnection] Missing authentication credentials");
        throw new Error("Missing authentication credentials");
      }

      console.log("[TwitchConnection] Starting connection attempt...");
      this.ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443/");

      this.ws.onopen = () => {
        console.log("[TwitchConnection] WebSocket connection established");
        this.authenticate(accessToken, username, channel);
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        const message = event.data;
        if (message.includes("PONG")) {
          this.lastPong = new Date();
          return;
        }
        this.onMessage(message);
      };

      this.ws.onclose = () => {
        console.log("[TwitchConnection] WebSocket connection closed");
        this.handleDisconnect();
      };

      this.ws.onerror = (error) => {
        console.error("[TwitchConnection] WebSocket error:", error);
        this.handleDisconnect();
      };
    } catch (error) {
      console.error("[TwitchConnection] Error in connect method:", error);
      this.handleDisconnect();
      throw error;
    }
  }

  private authenticate(accessToken: string, username: string, channel: string) {
    console.log("[TwitchConnection] Sending authentication commands...");
    this.ws?.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
    this.ws?.send(`PASS oauth:${accessToken}`);
    this.ws?.send(`NICK ${username}`);
    this.ws?.send(`JOIN #${channel}`);
    this.isConnected = true;
    this.onConnectionChange(true);
    this.reconnectAttempts = 0;
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send("PING :tmi.twitch.tv");
        
        // Check if we haven't received a PONG in the last 5 minutes
        if (this.lastPong && new Date().getTime() - this.lastPong.getTime() > 300000) {
          console.log("[TwitchConnection] No PONG received in 5 minutes, reconnecting...");
          this.handleDisconnect();
        }
      }
    }, 240000); // Send PING every 4 minutes
  }

  private handleDisconnect() {
    this.isConnected = false;
    this.onConnectionChange(false);
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[TwitchConnection] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), 5000 * this.reconnectAttempts);
    } else {
      console.error("[TwitchConnection] Max reconnection attempts reached");
    }
  }

  disconnect() {
    console.log("[TwitchConnection] Disconnecting...");
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.onConnectionChange(false);
  }

  getStatus(): string {
    return this.isConnected ? "Connected" : "Disconnected";
  }
}