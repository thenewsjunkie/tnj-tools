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

    // Execute authentication sequence with proper ordering and longer delays
    return (async () => {
      try {
        // First request capabilities
        await sendWithDelay("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership", 0);
        
        // Then send authentication with longer delay
        await sendWithDelay(`PASS oauth:${this.accessToken}`, 2000);
        
        // Set nickname with longer delay
        await sendWithDelay(`NICK ${this.channel.toLowerCase()}`, 4000);
        
        // Finally join the channel with longer delay
        await sendWithDelay(`JOIN #${this.channel.toLowerCase()}`, 6000);

        console.log("[TwitchAuthenticator] Authentication sequence completed");
      } catch (error) {
        console.error("[TwitchAuthenticator] Error during authentication sequence:", error);
        throw error;
      }
    })();
  }
}