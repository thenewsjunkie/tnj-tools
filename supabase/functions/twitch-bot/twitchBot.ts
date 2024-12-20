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
  private connectionCheckInterval: number | null = null;

  constructor(config: { channel: string; accessToken: string; clientId: string }) {
    this.connection = new TwitchConnection();
    this.authenticator = new TwitchAuthenticator(
      config.channel,
      config.accessToken,
      config.clientId
    );
    this.messageHandler = new MessageHandler(config.channel);
  }

  async connect() {
    try {
      console.log("[TwitchBot] Starting connection process");
      
      // Clear any existing connection check interval
      if (this.connectionCheckInterval) {
        clearInterval(this.connectionCheckInterval);
      }
      
      this.ws = await this.connection.connect();
      await this.setupConnection();
      
      // Set up connection health check
      this.connectionCheckInterval = setInterval(() => {
        this.checkConnectionHealth();
      }, 60000) as unknown as number;
      
      return true;
    } catch (error) {
      console.error("[TwitchBot] Error in connect method:", error);
      this.handleConnectionError();
      throw error;
    }
  }

  private async setupConnection() {
    if (!this.ws) return;

    try {
      // Setup WebSocket handlers
      this.setupWebSocketHandlers();
      
      // Authenticate
      await this.authenticator.authenticate(this.ws);
      
      // Setup ping interval after successful authentication
      this.connection.setupPingInterval(this.ws);
      
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      console.log("[TwitchBot] Connection setup completed successfully");
    } catch (error) {
      console.error("[TwitchBot] Error in setup:", error);
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

  private checkConnectionHealth() {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log("[TwitchBot] Connection health check failed, attempting reconnect");
      this.handleConnectionError();
    }
  }

  private handleConnectionError() {
    this.isConnected = false;
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`[TwitchBot] Attempting to reconnect in ${delay/1000} seconds (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
      
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
    if (!this.isConnected) {
      console.error("[TwitchBot] Cannot send message - not connected");
      throw new Error("Not connected to Twitch");
    }
    await this.messageHandler.sendMessage(this.ws!, message);
  }

  async disconnect() {
    console.log("[TwitchBot] Initiating disconnect");
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
    this.connection.disconnect();
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  getStatus(): string {
    return this.isConnected && 
           this.ws?.readyState === WebSocket.OPEN ? "connected" : "disconnected";
  }
}