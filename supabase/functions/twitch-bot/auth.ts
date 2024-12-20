export const authenticate = (ws: WebSocket, accessToken: string, username: string, channel: string) => {
  console.log("[TwitchBot] Sending authentication commands...");
  ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
  ws.send(`PASS oauth:${accessToken}`);
  ws.send(`NICK ${username}`);
  ws.send(`JOIN #${channel}`);
  console.log("[TwitchBot] Authentication commands sent, waiting for channel join confirmation");
};

export const getOAuthToken = async (clientId: string, clientSecret: string) => {
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
    console.error("[TwitchBot] OAuth token error:", errorData);
    throw new Error(`Failed to get OAuth token: ${tokenResponse.status} ${errorData}`);
  }

  const { access_token } = await tokenResponse.json();
  console.log("[TwitchBot] Successfully obtained OAuth token");
  return access_token;
};