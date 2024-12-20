export class TwitchConnection {
  private ws: WebSocket | null = null;
  private pingInterval: number | null = null;
  private lastPingSent: number = 0;
  private lastMessageReceived: number = 0;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private connectionTimeout: number | null = null;

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

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[TwitchConnection] Max reconnection attempts reached");
      throw new Error("Max reconnection attempts reached");
    }

    this.reconnectAttempts++;
    
    return new Promise((resolve, reject) => {
      try {
        console.log("[TwitchConnection] Creating new WebSocket instance");
        this.ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
        
        if (!this.ws) {
          console.error("[TwitchConnection] Failed to create WebSocket instance");
          return reject(new Error("WebSocket not initialized"));
        }

        // Set connection timeout
        this.connectionTimeout = setTimeout(() => {
          console.error("[TwitchConnection] Connection timeout");
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            this.ws.close();
            reject(new Error("Connection timeout"));
          }
        }, 45000) as unknown as number;

        this.ws.onopen = () => {
          console.log("[TwitchConnection] WebSocket connection established");
          this.clearConnectionTimeout();
          this.reconnectAttempts = 0;
          resolve(this.ws!);
        };

        this.ws.onerror = (error) => {
          console.error("[TwitchConnection] WebSocket error:", error);
          this.clearConnectionTimeout();
          
          // Log detailed error information
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
          
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            console.log(`[TwitchConnection] Will attempt to reconnect in ${delay}ms`);
          }
        };

      } catch (error) {
        console.error("[TwitchConnection] Error in connect:", error);
        this.clearConnectionTimeout();
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
        // Send PING every 3 minutes if no other messages received
        if (now - this.lastMessageReceived > 180000) {
          console.log("[TwitchConnection] Sending PING to maintain connection");
          ws.send("PING :tmi.twitch.tv");
          this.lastPingSent = now;
        }
      } else {
        console.log("[TwitchConnection] WebSocket not open during ping interval");
        this.clearTimers();
      }
    }, 60000) as unknown as number; // Check every minute
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
  }
}