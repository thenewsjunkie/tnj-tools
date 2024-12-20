export class TwitchAuthenticator {
  private authenticationTimeout: number | null = null;
  private messageHandler: ((event: MessageEvent) => void) | null = null;

  constructor(
    private channel: string,
    private accessToken: string,
    private clientId: string
  ) {
    console.log("[TwitchAuthenticator] Initializing for channel:", channel);
  }

  authenticate(ws: WebSocket) {
    console.log("[TwitchAuthenticator] Starting authentication sequence");
    
    return new Promise<void>((resolve, reject) => {
      let authenticated = false;
      let joinedChannel = false;

      // Handle incoming messages during authentication
      this.messageHandler = (event: MessageEvent) => {
        const message = event.data;
        console.log("[TwitchAuthenticator] Received:", message);

        // Check for authentication failures
        if (message.includes("Login authentication failed") || 
            message.includes("Improperly formatted auth")) {
          console.error("[TwitchAuthenticator] Authentication failed:", message);
          this.cleanup(ws);
          reject(new Error(`Authentication failed: ${message}`));
          return;
        }

        // Check for successful authentication (Twitch IRC welcome message)
        if (message.includes(":tmi.twitch.tv 001")) {
          console.log("[TwitchAuthenticator] Successfully authenticated");
          authenticated = true;
          // Request additional capabilities after authentication
          ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
          // Join channel after authentication
          ws.send(`JOIN #${this.channel.toLowerCase()}`);
        }

        // Check for successful channel join
        if (message.includes(`JOIN #${this.channel.toLowerCase()}`)) {
          console.log("[TwitchAuthenticator] Successfully joined channel");
          joinedChannel = true;
        }

        // Check for capability acknowledgment
        if (message.includes("CAP * ACK")) {
          console.log("[TwitchAuthenticator] Capabilities acknowledged");
        }

        // Resolve when we're both authenticated and joined the channel
        if (authenticated && joinedChannel) {
          console.log("[TwitchAuthenticator] Authentication and channel join complete");
          this.cleanup(ws);
          resolve();
        }
      };

      // Add message handler for authentication process
      ws.addEventListener('message', this.messageHandler);

      // Set authentication timeout - reduced to 30 seconds
      this.authenticationTimeout = setTimeout(() => {
        this.cleanup(ws);
        reject(new Error("Authentication timeout - no response from Twitch"));
      }, 30000) as unknown as number;

      // Execute authentication sequence with delays
      this.executeAuthSequence(ws).catch(reject);
    });
  }

  private async executeAuthSequence(ws: WebSocket) {
    try {
      // Send PASS command with oauth: prefix
      ws.send(`PASS oauth:${this.accessToken}`);
      console.log("[TwitchAuthenticator] Sent PASS command");
      
      // Small delay between commands
      await new Promise(resolve => setTimeout(resolve, 500));

      // Send NICK command
      ws.send(`NICK ${this.channel.toLowerCase()}`);
      console.log("[TwitchAuthenticator] Sent NICK command");

      // Add client ID to connection
      ws.send(`PASS ${this.clientId}`);
      console.log("[TwitchAuthenticator] Sent client ID");

    } catch (error) {
      console.error("[TwitchAuthenticator] Error in auth sequence:", error);
      throw error;
    }
  }

  private cleanup(ws: WebSocket) {
    if (this.messageHandler) {
      ws.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }
    if (this.authenticationTimeout !== null) {
      clearTimeout(this.authenticationTimeout);
      this.authenticationTimeout = null;
    }
  }
}