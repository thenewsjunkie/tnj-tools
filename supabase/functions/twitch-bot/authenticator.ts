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
    
    // Add delay between commands to prevent rate limiting
    const sendWithDelay = (message: string, delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
            console.log("[TwitchAuthenticator] Sent command:", message);
            resolve();
          } else {
            console.error("[TwitchAuthenticator] WebSocket not open when trying to send:", message);
            resolve();
          }
        }, delay);
      });
    };

    // Execute authentication sequence
    return (async () => {
      try {
        // Request Twitch-specific capabilities
        await sendWithDelay("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership", 0);
        
        // Send authentication with oauth token
        await sendWithDelay(`PASS oauth:${this.accessToken}`, 1000);
        
        // Set nickname (same as channel for bot)
        await sendWithDelay(`NICK ${this.channel.toLowerCase()}`, 2000);
        
        // Join the channel
        await sendWithDelay(`JOIN #${this.channel.toLowerCase()}`, 3000);

        console.log("[TwitchAuthenticator] Authentication sequence completed");
      } catch (error) {
        console.error("[TwitchAuthenticator] Error during authentication sequence:", error);
        throw error;
      }
    })();
  }
}