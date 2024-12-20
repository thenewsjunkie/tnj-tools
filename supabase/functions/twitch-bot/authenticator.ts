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
      let authenticationTimeout: number;
      let authenticated = false;

      // Handle incoming messages during authentication
      const messageHandler = (event: MessageEvent) => {
        const message = event.data;
        console.log("[TwitchAuthenticator] Received:", message);

        // Check for successful authentication response
        if (message.includes(":tmi.twitch.tv 001")) {
          console.log("[TwitchAuthenticator] Successfully authenticated");
          authenticated = true;
          ws.send(`JOIN #${this.channel.toLowerCase()}`);
        }

        // Check for successful channel join
        if (message.includes(`JOIN #${this.channel.toLowerCase()}`)) {
          console.log("[TwitchAuthenticator] Successfully joined channel");
          cleanup();
          resolve();
        }

        // Check for authentication failure
        if (message.includes("Login authentication failed")) {
          cleanup();
          reject(new Error("Authentication failed"));
        }
      };

      const cleanup = () => {
        ws.removeEventListener('message', messageHandler);
        clearTimeout(authenticationTimeout);
      };

      // Set timeout for entire authentication process - increased to 45 seconds
      authenticationTimeout = setTimeout(() => {
        cleanup();
        reject(new Error("Authentication timeout"));
      }, 45000) as unknown as number;

      // Add message handler for authentication process
      ws.addEventListener('message', messageHandler);

      // Execute authentication sequence
      const authenticate = async () => {
        try {
          // Send PASS command with oauth: prefix
          ws.send(`PASS oauth:${this.accessToken}`);
          console.log("[TwitchAuthenticator] Sent PASS command");
          
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Send NICK command
          ws.send(`NICK ${this.channel.toLowerCase()}`);
          console.log("[TwitchAuthenticator] Sent NICK command");
          
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Request capabilities
          ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
          console.log("[TwitchAuthenticator] Sent CAP REQ command");
        } catch (error) {
          cleanup();
          reject(error);
        }
      };

      authenticate().catch(reject);
    });
  }
}