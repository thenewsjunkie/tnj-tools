export class TwitchAuthenticator {
  constructor(
    private channel: string,
    private accessToken: string
  ) {
    console.log("[TwitchAuthenticator] Initializing for channel:", channel);
  }

  authenticate(ws: WebSocket) {
    console.log("[TwitchAuthenticator] Starting authentication sequence");
    
    // Add delay between commands to prevent rate limiting
    const sendWithDelay = (message: string, delay: number) => {
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
          console.log("[TwitchAuthenticator] Sent command:", message);
        } else {
          console.error("[TwitchAuthenticator] WebSocket not open when trying to send:", message);
        }
      }, delay);
    };

    // Request Twitch-specific capabilities
    sendWithDelay("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership", 0);
    
    // Send authentication with oauth token
    sendWithDelay(`PASS oauth:${this.accessToken}`, 1000);
    
    // Set nickname (same as channel for bot)
    sendWithDelay(`NICK ${this.channel.toLowerCase()}`, 2000);
    
    // Join the channel
    sendWithDelay(`JOIN #${this.channel.toLowerCase()}`, 3000);
  }
}