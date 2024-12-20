export class TwitchConnection {
  private ws: WebSocket | null = null;
  private pingInterval: number | null = null;
  private lastPingSent: number = 0;
  private lastMessageReceived: number = 0;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private connectionTimeout: number | null = null;
  private isReconnecting: boolean = false;

  constructor() {
    console.log("[TwitchConnection] Initializing connection handler");
  }

  async connect(): Promise<WebSocket> {
    console.log("[TwitchConnection] Starting new WebSocket connection");
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("[TwitchConnection] Already connected");
      return this.ws;
    }

    if (this.isReconnecting) {
      console.log("[TwitchConnection] Reconnection already in progress");
      throw new Error("Reconnection already in progress");
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[TwitchConnection] Max reconnection attempts reached");
      this.reconnectAttempts = 0;
      throw new Error("Max reconnection attempts reached");
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;
    
    return new Promise((resolve, reject) => {
      try {
        console.log(`[TwitchConnection] Creating new WebSocket instance (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
        
        if (!this.ws) {
          this.isReconnecting = false;
          console.error("[TwitchConnection] Failed to create WebSocket instance");
          return reject(new Error("WebSocket not initialized"));
        }

        // Set connection timeout to 30 seconds
        this.connectionTimeout = setTimeout(() => {
          console.error("[TwitchConnection] Connection timeout");
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            this.ws.close();
            this.isReconnecting = false;
            reject(new Error("Connection timeout"));
          }
        }, 30000) as unknown as number;

        this.ws.onopen = () => {
          console.log("[TwitchConnection] WebSocket connection established");
          this.clearConnectionTimeout();
          this.isReconnecting = false;
          this.lastMessageReceived = Date.now();
          resolve(this.ws!);
        };

        this.ws.onerror = (error) => {
          console.error("[TwitchConnection] WebSocket error:", error);
          this.clearConnectionTimeout();
          
          if (error instanceof ErrorEvent) {
            console.error("[TwitchConnection] Error details:", {
              message: error.message,
              filename: error.filename,
              lineno: error.lineno,
              colno: error.colno,
              error: error.error
            });
          }
          
          if (this.ws?.readyState === WebSocket.CLOSED) {
            this.isReconnecting = false;
            reject(new Error(`WebSocket connection failed: ${error.type}`));
          }
        };

        this.ws.onclose = (event) => {
          console.log("[TwitchConnection] WebSocket closed:", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          });
          this.clearConnectionTimeout();
          this.clearTimers();
          this.isReconnecting = false;
          
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            console.log(`[TwitchConnection] Will attempt to reconnect in ${delay}ms`);
          }
        };

      } catch (error) {
        console.error("[TwitchConnection] Error in connect:", error);
        this.clearConnectionTimeout();
        this.isReconnecting = false;
        reject(error);
      }
    });
  }

  private clearConnectionTimeout() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  setupPingInterval(ws: WebSocket) {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    this.pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const now = Date.now();
        // Send PING every 2 minutes if no other messages received
        if (now - this.lastMessageReceived > 120000) {
          console.log("[TwitchConnection] Sending PING to maintain connection");
          ws.send("PING :tmi.twitch.tv");
          this.lastPingSent = now;
        }

        // Check for connection timeout (no messages for 5 minutes)
        if (now - this.lastMessageReceived > 300000) {
          console.log("[TwitchConnection] Connection timeout - no messages received");
          this.disconnect();
          this.connect().catch(console.error);
        }
      } else {
        console.log("[TwitchConnection] WebSocket not open during ping interval");
        this.clearTimers();
      }
    }, 30000) as unknown as number; // Check every 30 seconds
  }

  messageReceived() {
    this.lastMessageReceived = Date.now();
  }

  clearTimers() {
    this.clearConnectionTimeout();
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
    this.isReconnecting = false;
  }
}