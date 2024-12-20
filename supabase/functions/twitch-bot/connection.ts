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
      }, 10000);

      this.ws.onopen = () => {
        clearTimeout(timeout);
        this.reconnectAttempts = 0;
        resolve(this.ws!);
      };

      this.ws.onerror = (error) => {
        clearTimeout(timeout);
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
        if (now - this.lastMessageReceived > 60000 && now - this.lastPingSent > 30000) {
          console.log("[TwitchConnection] Sending PING to maintain connection");
          ws.send("PING :tmi.twitch.tv");
          this.lastPingSent = now;
        }
      } else {
        console.log("[TwitchConnection] WebSocket not open during ping interval");
        this.clearTimers();
      }
    }, 30000) as unknown as number;
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