export const authenticate = (ws: WebSocket, accessToken: string, username: string, channel: string) => {
  console.log("[TwitchBot] Starting authentication process for channel:", channel);
  console.log("[TwitchBot] Using username:", username);
  
  if (!accessToken) {
    console.error("[TwitchBot] Authentication failed: No access token provided");
    throw new Error("No access token provided");
  }

  // Add delay between commands to prevent rate limiting
  const sendWithDelay = (message: string, delay: number) => {
    setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        console.log("[TwitchBot] Sent command:", message);
      } else {
        console.error("[TwitchBot] WebSocket not open when trying to send:", message);
        console.log("[TwitchBot] WebSocket state:", ws.readyState);
      }
    }, delay);
  };

  // Send capabilities request before authentication
  sendWithDelay("CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership", 0);
  
  // Send authentication with oauth prefix
  sendWithDelay(`PASS oauth:${accessToken}`, 1000);
  
  // Send nickname
  sendWithDelay(`NICK ${username.toLowerCase()}`, 2000);
  
  // Send join command
  sendWithDelay(`JOIN #${channel.toLowerCase()}`, 3000);
};

export const getOAuthToken = async (clientId: string, clientSecret: string) => {
  try {
    console.log("[TwitchBot] Starting OAuth token request process");
    
    if (!clientId || !clientSecret) {
      throw new Error("Missing client ID or secret");
    }

    console.log("[TwitchBot] Making OAuth token request with scopes: chat:read chat:edit");
    
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope: 'chat:read chat:edit'
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
      console.log("[TwitchBot] Successfully parsed OAuth response");
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