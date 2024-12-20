export class TwitchConnection {
  private ws: WebSocket | null = null;
  private pingInterval: number | null = null;
  private lastPingSent: number = 0;
  private lastMessageReceived: number = 0;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

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
    this.ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
    
    return new Promise((resolve, reject) => {
      if (!this.ws) return reject(new Error("WebSocket not initialized"));

      const timeout = setTimeout(() => {
        reject(new Error("Connection timeout"));
        this.ws?.close();
      }, 30000); // Increased timeout to 30 seconds

      this.ws.onopen = () => {
        clearTimeout(timeout);
        console.log("[TwitchConnection] WebSocket connection established");
        this.reconnectAttempts = 0;
        resolve(this.ws!);
      };

      this.ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error("[TwitchConnection] WebSocket error:", error);
        reject(error);
      };
    });
  }

  setupPingInterval(ws: WebSocket) {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    this.pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const now = Date.now();
        // Send PING every 4 minutes if no other messages received
        if (now - this.lastMessageReceived > 240000) {
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