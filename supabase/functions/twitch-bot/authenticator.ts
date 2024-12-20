export class TwitchAuthenticator {
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
      let capAcknowledged = false;
      let authenticationTimeout: number;

      // Handle incoming messages during authentication
      const messageHandler = (event: MessageEvent) => {
        const message = event.data;
        console.log("[TwitchAuthenticator] Received:", message);

        if (message.includes("CAP * ACK")) {
          console.log("[TwitchAuthenticator] Capabilities acknowledged");
          capAcknowledged = true;
          // Now that CAP is acknowledged, we can join the channel
          ws.send(`JOIN #${this.channel.toLowerCase()}`);
        }

        if (message.includes(`JOIN #${this.channel.toLowerCase()}`)) {
          console.log("[TwitchAuthenticator] Successfully joined channel");
          cleanup();
          resolve();
        }

        if (message.includes("Login authentication failed")) {
          cleanup();
          reject(new Error("Authentication failed"));
        }
      };

      const cleanup = () => {
        ws.removeEventListener('message', messageHandler);
        clearTimeout(authenticationTimeout);
      };

      // Set timeout for entire authentication process
      authenticationTimeout = setTimeout(() => {
        cleanup();
        reject(new Error("Authentication timeout"));
      }, 30000) as unknown as number;

      // Add message handler for authentication process
      ws.addEventListener('message', messageHandler);

      // Execute authentication sequence
      const authenticate = async () => {
        try {
          // 1. Send PASS command first - this MUST be first
          ws.send(`PASS oauth:${this.accessToken}`);
          console.log("[TwitchAuthenticator] Sent PASS command");
          
          // Small delay to ensure commands are processed in order
          await new Promise(resolve => setTimeout(resolve, 1000));

          // 2. Send NICK command
          ws.send(`NICK ${this.channel.toLowerCase()}`);
          console.log("[TwitchAuthenticator] Sent NICK command");
          
          await new Promise(resolve => setTimeout(resolve, 1000));

          // 3. Request capabilities and wait for acknowledgment
          ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
          console.log("[TwitchAuthenticator] Sent CAP REQ command");
          
          // Note: We don't send JOIN here - we wait for CAP acknowledgment first
        } catch (error) {
          cleanup();
          reject(error);
        }
      };

      authenticate().catch(reject);
    });
  }
}