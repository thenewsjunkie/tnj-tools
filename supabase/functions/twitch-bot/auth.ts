export const authenticate = (ws: WebSocket, accessToken: string, username: string, channel: string) => {
  console.log("[TwitchBot] Starting authentication process for channel:", channel);
  
  if (!accessToken) {
    console.error("[TwitchBot] Authentication failed: No access token provided");
    throw new Error("No access token provided");
  }

  // Send capabilities request before authentication
  ws.send("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership");
  console.log("[TwitchBot] Sent capabilities request");
  
  // Send authentication with oauth prefix
  ws.send(`PASS oauth:${accessToken}`);
  console.log("[TwitchBot] Sent OAuth authentication");
  
  ws.send(`NICK ${username.toLowerCase()}`);
  console.log("[TwitchBot] Sent NICK command with username:", username.toLowerCase());
  
  ws.send(`JOIN #${channel.toLowerCase()}`);
  console.log("[TwitchBot] Sent JOIN command for channel:", channel.toLowerCase());
};

export const getOAuthToken = async (clientId: string, clientSecret: string) => {
  try {
    console.log("[TwitchBot] Requesting OAuth token...");
    console.log("[TwitchBot] Using client ID:", clientId.slice(0, 5) + "...");
    
    if (!clientId || !clientSecret) {
      throw new Error("Missing client ID or secret");
    }

    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope: 'chat:read chat:edit channel:moderate channel:read:subscriptions'
      })
    });

    const responseText = await tokenResponse.text();
    console.log("[TwitchBot] OAuth response status:", tokenResponse.status);
    console.log("[TwitchBot] OAuth response headers:", 
      Object.fromEntries(tokenResponse.headers.entries())
    );

    if (!tokenResponse.ok) {
      console.error("[TwitchBot] OAuth token error response:", responseText);
      throw new Error(`Failed to get OAuth token: ${tokenResponse.status} ${responseText}`);
    }

    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
    } catch (error) {
      console.error("[TwitchBot] Failed to parse OAuth response:", error);
      console.error("[TwitchBot] Raw response was:", responseText);
      throw new Error('Failed to parse OAuth response');
    }

    if (!tokenData.access_token) {
      console.error("[TwitchBot] OAuth response missing access token:", tokenData);
      throw new Error('OAuth response missing access token');
    }

    console.log("[TwitchBot] Successfully obtained OAuth token");
    return tokenData.access_token;
  } catch (error) {
    console.error("[TwitchBot] Error getting OAuth token:", error);
    throw error;
  }
}