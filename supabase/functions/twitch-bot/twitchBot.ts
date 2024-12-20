import { TwitchConnection } from "./connection";
import { TwitchAuthenticator } from "./authenticator";
import { MessageHandler } from "./messageHandler";

export class TwitchBot {
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