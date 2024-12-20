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
      let capabilitiesAcknowledged = false;

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
        }

        // Check for successful channel join
        if (message.includes(`JOIN #${this.channel.toLowerCase()}`)) {
          console.log("[TwitchAuthenticator] Successfully joined channel");
          joinedChannel = true;
        }

        // Check for capability acknowledgment
        if (message.includes("CAP * ACK")) {
          console.log("[TwitchAuthenticator] Capabilities acknowledged");
          capabilitiesAcknowledged = true;
        }

        // Resolve when all conditions are met
        if (authenticated && joinedChannel && capabilitiesAcknowledged) {
          console.log("[TwitchAuthenticator] Authentication and channel join complete");
          this.cleanup(ws);
          resolve();
        }
      };

      // Add message handler for authentication process
      ws.addEventListener('message', this.messageHandler);

      // Set authentication timeout - increased to 60 seconds for slower connections
      this.authenticationTimeout = setTimeout(() => {
        this.cleanup(ws);
        reject(new Error("Authentication timeout - no response from Twitch"));
      }, 60000) as unknown as number;

      // Execute authentication sequence with delays
      this.executeAuthSequence(ws).catch(reject);
    });
  }

  private async executeAuthSequence(ws: WebSocket) {
    try {
      // Request capabilities first
      ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
      console.log("[TwitchAuthenticator] Requested capabilities");
      
      // Small delay after capabilities request
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Send PASS command with oauth: prefix
      ws.send(`PASS oauth:${this.accessToken}`);
      console.log("[TwitchAuthenticator] Sent PASS command");
      
      // Small delay between commands
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Send NICK command
      ws.send(`NICK ${this.channel.toLowerCase()}`);
      console.log("[TwitchAuthenticator] Sent NICK command");

      // Small delay before joining channel
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Join channel
      ws.send(`JOIN #${this.channel.toLowerCase()}`);
      console.log("[TwitchAuthenticator] Sent JOIN command");

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