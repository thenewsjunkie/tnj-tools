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

    // Execute authentication sequence with proper ordering and delays
    return (async () => {
      try {
        // 1. Send PASS command first - this MUST be first
        await sendWithDelay(`PASS oauth:${this.accessToken}`, 0);
        
        // 2. Send NICK command immediately after PASS
        await sendWithDelay(`NICK ${this.channel.toLowerCase()}`, 1000);
        
        // 3. Request capabilities
        await sendWithDelay("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership", 2000);
        
        // 4. Finally join the channel
        await sendWithDelay(`JOIN #${this.channel.toLowerCase()}`, 3000);

        console.log("[TwitchAuthenticator] Authentication sequence completed");
      } catch (error) {
        console.error("[TwitchAuthenticator] Error during authentication sequence:", error);
        throw error;
      }
    })();
  }
}