export const authenticate = (ws: WebSocket, accessToken: string, username: string, channel: string) => {
  console.log("[TwitchBot] Sending authentication commands...");
  // Send capabilities request before authentication
  ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
  // Send authentication with oauth prefix
  ws.send(`PASS oauth:${accessToken}`);
  ws.send(`NICK ${username.toLowerCase()}`);
  ws.send(`JOIN #${channel.toLowerCase()}`);
  console.log("[TwitchBot] Authentication commands sent, waiting for channel join confirmation");
};

export const getOAuthToken = async (clientId: string, clientSecret: string) => {
  try {
    console.log("[TwitchBot] Requesting OAuth token...");
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope: 'chat:read chat:edit channel:moderate channel:read:subscriptions'
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("[TwitchBot] OAuth token error response:", errorData);
      throw new Error(`Failed to get OAuth token: ${tokenResponse.status} ${errorData}`);
    }

    const { access_token } = await tokenResponse.json();
    console.log("[TwitchBot] Successfully obtained OAuth token");
    return access_token;
  } catch (error) {
    console.error("[TwitchBot] Error getting OAuth token:", error);
    throw error;
  }
}