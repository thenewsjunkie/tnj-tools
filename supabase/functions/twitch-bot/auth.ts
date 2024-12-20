export const getOAuthToken = async (clientId: string, clientSecret: string) => {
  try {
    console.log("[TwitchAuth] Starting OAuth token request process");
    
    if (!clientId || !clientSecret) {
      throw new Error("Missing client ID or secret");
    }

    console.log("[TwitchAuth] Making OAuth token request");
    
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

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("[TwitchAuth] OAuth token error response:", errorText);
      throw new Error(`Failed to get OAuth token: ${tokenResponse.status} ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error("[TwitchAuth] OAuth response missing access token:", tokenData);
      throw new Error('OAuth response missing access token');
    }

    console.log("[TwitchAuth] Successfully obtained OAuth token");
    return tokenData.access_token;
  } catch (error) {
    console.error("[TwitchAuth] Error getting OAuth token:", error);
    throw error;
  }
}